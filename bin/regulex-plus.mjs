#!/usr/bin/env node
import { parseArgs } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve, extname } from "node:path";
import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_HTML = resolve(__dirname, "..", "docs", "index.html");

const HELP = `regulex-plus — visualize a JavaScript regex as SVG/PNG

Usage:
  regulex-plus <regex> [options]
  regulex-plus --regex <regex> [options]

Options:
  -r, --regex   <pattern>   Regex source (alternative to positional arg)
  -f, --flags   <flags>     Regex flags, e.g. "ig"
  -o, --out     <path>      Output file (default: ./regulex.png)
      --format  <png|svg>   Output format (inferred from --out extension if given)
      --theme   <light|dark>  Diagram theme (default: light)
      --lang    <zh|en>     UI/label language (default: zh)
      --scale   <number>    PNG device scale factor (default: 2)
      --timeout <ms>        Max wait for diagram render (default: 10000)
      --debug               Print page console logs
  -h, --help                Show this help

Examples:
  regulex-plus '^(a|b)*?$' -o out.svg
  regulex-plus '中文(标点|符号)+' --theme dark --out cjk.png
  regulex-plus '\\d{3}-\\d{4}' --flags i --format svg -o phone.svg
`;

function die(msg, code = 1) {
  process.stderr.write(`regulex-plus: ${msg}\n`);
  process.exit(code);
}

const { values, positionals } = parseArgs({
  options: {
    regex:   { type: "string", short: "r" },
    flags:   { type: "string", short: "f", default: "" },
    out:     { type: "string", short: "o" },
    format:  { type: "string" },
    theme:   { type: "string", default: "light" },
    lang:    { type: "string", default: "zh" },
    scale:   { type: "string", default: "2" },
    timeout: { type: "string", default: "10000" },
    debug:   { type: "boolean", default: false },
    help:    { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

if (values.help) {
  process.stdout.write(HELP);
  process.exit(0);
}

const regex = values.regex ?? positionals[0];
if (!regex) die("missing <regex>. Use --help for usage.");

if (!["light", "dark"].includes(values.theme)) die(`--theme must be light|dark`);
if (!["zh", "en"].includes(values.lang))       die(`--lang must be zh|en`);

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
}
format = format || "png";
if (!["png", "svg"].includes(format)) die(`--format must be png|svg`);
outPath = resolve(outPath || `./regulex.${format}`);

const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({ deviceScaleFactor: scale });
  const page = await ctx.newPage();

  if (values.debug) {
    page.on("console", (m) => process.stderr.write(`[page:${m.type()}] ${m.text()}\n`));
    page.on("pageerror", (e) => process.stderr.write(`[pageerror] ${e.message}\n`));
  }

  await page.goto(pathToFileURL(DOCS_HTML).href, { waitUntil: "domcontentloaded" });
  // Wait for app bundle to wire up handlers
  await page.waitForSelector("#input", { state: "attached", timeout });
  await page.waitForSelector("#visualIt", { state: "attached", timeout });

  // Switch theme/lang if controls exist (silently no-op otherwise)
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
  }, { theme: values.theme, lang: values.lang });

  // Fill regex
  const input = page.locator("#input");
  await input.fill(regex);

  // Fill flags via #flagBox children (each flag is a toggle). Best-effort.
  if (values.flags) {
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
    }, values.flags);
  }

  // Trigger visualization
  await page.click("#visualIt").catch(async () => {
    await input.press("Enter");
  });

  // Wait for SVG to appear in #graphCt
  const svgLoc = page.locator("#graphCt svg");
  await svgLoc.first().waitFor({ state: "visible", timeout });

  // Check for error box content
  const err = (await page.locator("#errorBox").textContent({ timeout: 500 }).catch(() => "")) || "";
  if (err.trim()) die(`regex error: ${err.trim()}`);

  if (format === "svg") {
    const svgMarkup = await svgLoc.first().evaluate((el) => {
      // Inline computed styles so the SVG looks the same standalone.
      const clone = el.cloneNode(true);
      return new XMLSerializer().serializeToString(clone);
    });
    const xmlDecl = '<?xml version="1.0" encoding="UTF-8"?>\n';
    await writeFile(outPath, xmlDecl + svgMarkup, "utf8");
  } else {
    // PNG: screenshot the SVG element
    const buf = await svgLoc.first().screenshot({ omitBackground: false });
    await writeFile(outPath, buf);
  }

  process.stdout.write(`${outPath}\n`);
} finally {
  await browser.close();
}
