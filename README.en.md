# Regulex+

[中文](README.md) | EN

> JavaScript regular-expression parser & visualizer — modernized UI, native CJK support, railroad-style diagrams.

**🌐 Live demo: <https://pipedream941.github.io/regulex-plus/>**

No install, no backend — just open it in a browser.

## Features

- 🎨 **Modern UI** — dark / light themes, DM Sans + JetBrains Mono, Tweaks panel for accent color and canvas background
- 🌏 **Bilingual (EN / 中文)** — one-click toggle; all UI strings, tooltips, and presets localized
- 📐 **Rounded SVG nodes** — restyled Begin / End, quantifier, and character-class nodes with rounded corners
- 🈯 **Native Unicode / CJK rendering** — graph labels show `你好` directly instead of `你好`
- 📏 **Mixed-width layout fix** — `visualize` measures by visual character width to prevent header clipping
- 🖼 **PNG export** — colors and corner radii inlined onto the SVG, 2× DPR download
- 📦 **Zero backend** — single HTML file, embeddable via `<iframe>`

## Try it

Open the live demo: <https://pipedream941.github.io/regulex-plus/>

Click a chip at the top to load a preset: `email` · `phone` · `url` · `iso-date` · a long Chinese in-car navigation regex.

## Run Locally

```bash
git clone https://github.com/PipeDream941/regulex-plus.git
cd regulex-plus
python -m http.server -d docs 8000
# open http://localhost:8000
```

You can also open `docs/index.html` directly, but a static server is recommended for consistent SVG behavior across browsers.

## CLI / Claude Skill

This package ships a Node CLI that renders any JS regex to a PNG/SVG file without opening a browser, plus a `SKILL.md` so it can be auto-invoked by [Claude Code](https://skills.sh/) and compatible agents.

```bash
# Render to ./regulex.png
npx regulex-plus '^(a|b)*?$'

# Path & format (format inferred from extension)
npx regulex-plus '中文(标点|符号)+' --out diagrams/cjk.png
npx regulex-plus '\d{3}-\d{4}' --format svg --out phone.svg

# Dark theme, English labels, 2× DPR
npx regulex-plus '(?:abc|def)+' --theme dark --lang en --scale 2 --out demo.png

# Full options
npx regulex-plus --help
```

First run downloads Chromium (~92MB). If it fails, run `npx playwright install chromium` manually.

### Install as a Skill

```bash
npx skills add PipeDream941/regulex-plus
```

After installation, agents that follow the skill protocol (e.g. Claude Code) will suggest invoking this CLI whenever a complex or CJK-heavy regex appears in conversation.

## Repository Layout

| Path | Description |
| --- | --- |
| `docs/index.html` | Deployed entry point; GitHub Pages source |
| `src/` | TypeScript source |
| `test/` | Tests and benchmarks |

## Credits

Forked from [CJex/regulex](https://github.com/CJex/regulex) (original author jex.im). Regulex+ adds UI modernization, CJK rendering fixes, working PNG export, i18n, and more.

## License

[MIT](LICENSE)
