#!/usr/bin/env node
import { parseArgs } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve, extname } from "node:path";
import { writeFile } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_HTML = resolve(__dirname, "..", "docs", "index.html");

const HELP = `regulex-plus — visualize a JavaScript regex as PNG / SVG / Mermaid

Usage:
  regulex-plus <regex> [options]
  regulex-plus --regex <regex> [options]

Options:
  -r, --regex     <pattern>        Regex source (alternative to positional arg)
  -f, --flags     <flags>          Regex flags, e.g. "ig"
  -o, --out       <path>           Output file (default: ./regulex.<format>)
      --format    <png|svg|mermaid>  Output format (inferred from --out extension if given;
                                   .mmd / .mermaid imply mermaid)
      --theme     <light|dark>     Diagram theme (default: light)
      --lang      <zh|en>          UI/label language for PNG/SVG (default: zh)
      --direction <LR|TD>          Mermaid direction: Left-Right or Top-Down (default: LR)
      --scale     <number>         PNG device scale factor (default: 2)
      --timeout   <ms>             Max wait for PNG/SVG render (default: 10000)
      --debug                      Print page console logs (PNG/SVG only)
  -h, --help                       Show this help

Examples:
  regulex-plus '^(a|b)*?$' -o out.svg
  regulex-plus '中文(标点|符号)+' --theme dark --out cjk.png
  regulex-plus '\\d{3}-\\d{4}' --format svg -o phone.svg
  regulex-plus '^(?:\\d{3}-)?\\d{3,4}-\\d{4}$' --format mermaid -o phone.mmd
  regulex-plus '^(a|b)*?$' --format mermaid --direction TD > flow.mmd

Notes:
  - Mermaid format is text and does not require Chromium (faster, smaller).
  - PNG/SVG formats drive docs/index.html in headless Chromium.
`;

function die(msg, code = 1) {
  process.stderr.write(`regulex-plus: ${msg}\n`);
  process.exit(code);
}

const { values, positionals } = parseArgs({
  options: {
    regex:     { type: "string", short: "r" },
    flags:     { type: "string", short: "f", default: "" },
    out:       { type: "string", short: "o" },
    format:    { type: "string" },
    theme:     { type: "string", default: "light" },
    lang:      { type: "string", default: "zh" },
    direction: { type: "string", default: "LR" },
    scale:     { type: "string", default: "2" },
    timeout:   { type: "string", default: "10000" },
    debug:     { type: "boolean", default: false },
    help:      { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

if (values.help) {
  process.stdout.write(HELP);
  process.exit(0);
}

const regex = values.regex ?? positionals[0];
if (!regex) die("missing <regex>. Use --help for usage.");

if (!["light", "dark"].includes(values.theme))      die(`--theme must be light|dark`);
if (!["zh", "en"].includes(values.lang))            die(`--lang must be zh|en`);
if (!["LR", "TD"].includes(values.direction))       die(`--direction must be LR|TD`);

const scale   = Number(values.scale);
const timeout = Number(values.timeout);
if (!(scale > 0))   die(`--scale must be > 0`);
if (!(timeout > 0)) die(`--timeout must be > 0`);

// Resolve output path and format
let outPath = values.out;
let format = values.format;
if (!format && outPath) {
  const ext = extname(outPath).toLowerCase().slice(1);
  if (ext === "svg" || ext === "png") format = ext;
  else if (ext === "mmd" || ext === "mermaid") format = "mermaid";
}
format = format || "png";
if (!["png", "svg", "mermaid"].includes(format)) die(`--format must be png|svg|mermaid`);

const defaultExt = format === "mermaid" ? "mmd" : format;
outPath = resolve(outPath || `./regulex.${defaultExt}`);

if (format === "mermaid") {
  await renderMermaid({ regex, flags: values.flags, theme: values.theme, direction: values.direction, outPath });
} else {
  await renderBrowser({
    regex, flags: values.flags, theme: values.theme, lang: values.lang,
    scale, timeout, debug: values.debug, format, outPath,
  });
}

process.stdout.write(`${outPath}\n`);

// ---------- mermaid path ----------

async function renderMermaid({ regex, flags, theme, direction, outPath }) {
  const { regexToMermaid } = await import("regex-to-mermaid");
  const mermaidTheme = theme === "dark" ? "dark" : "default";

  // Construct source the lib accepts. If flags supplied, build a RegExp; otherwise pass string.
  let pattern;
  if (flags) {
    try {
      pattern = new RegExp(regex, flags);
    } catch (e) {
      die(`regex error: ${e.message}`);
    }
  } else {
    pattern = regex;
  }

  let out;
  try {
    out = regexToMermaid(pattern, { direction, theme: mermaidTheme });
  } catch (e) {
    die(`mermaid conversion failed: ${e.message}`);
  }
  await writeFile(outPath, out, "utf8");
}

// ---------- browser path ----------

async function renderBrowser({ regex, flags, theme, lang, scale, timeout, debug, format, outPath }) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ deviceScaleFactor: scale });
    const page = await ctx.newPage();

    if (debug) {
      page.on("console", (m) => process.stderr.write(`[page:${m.type()}] ${m.text()}\n`));
      page.on("pageerror", (e) => process.stderr.write(`[pageerror] ${e.message}\n`));
    }

    await page.goto(pathToFileURL(DOCS_HTML).href, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#input", { state: "attached", timeout });
    await page.waitForSelector("#visualIt", { state: "attached", timeout });

    await page.evaluate(({ theme, lang }) => {
      const themeSel = document.getElementById("themeSelect");
      if (themeSel && "value" in themeSel) {
        themeSel.value = theme;
        themeSel.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const langSel = document.getElementById("langSelect");
      if (langSel && "value" in langSel) {
        langSel.value = lang;
        langSel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, { theme, lang });

    const input = page.locator("#input");
    await input.fill(regex);

    if (flags) {
      await page.evaluate((flags) => {
        const box = document.getElementById("flagBox");
        if (!box) return;
        const wanted = new Set(flags.split(""));
        box.querySelectorAll("[data-flag], .flag-toggle, input[type=checkbox]").forEach((el) => {
          const flag = el.dataset?.flag ?? el.getAttribute("value") ?? el.textContent?.trim();
          if (!flag) return;
          const want = wanted.has(flag);
          const isOn = el.classList.contains("on") || el.classList.contains("active") || el.checked;
          if (want !== isOn) el.click();
        });
      }, flags);
    }

    await page.click("#visualIt").catch(async () => { await input.press("Enter"); });

    const svgLoc = page.locator("#graphCt svg");
    await svgLoc.first().waitFor({ state: "visible", timeout });

    const err = (await page.locator("#errorBox").textContent({ timeout: 500 }).catch(() => "")) || "";
    if (err.trim()) die(`regex error: ${err.trim()}`);

    if (format === "svg") {
      const svgMarkup = await svgLoc.first().evaluate((el) => {
        const clone = el.cloneNode(true);
        return new XMLSerializer().serializeToString(clone);
      });
      await writeFile(outPath, '<?xml version="1.0" encoding="UTF-8"?>\n' + svgMarkup, "utf8");
    } else {
      const buf = await svgLoc.first().screenshot({ omitBackground: false });
      await writeFile(outPath, buf);
    }
  } finally {
    await browser.close();
  }
}
