# RegulexPlus

[中文](README.md) | EN

> JavaScript regular-expression parser & visualizer — modernized UI, native CJK support, railroad-style diagrams.

**🌐 Live demo: <https://pipedream941.github.io/RegulexPlus/>**

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

Open the live demo: <https://pipedream941.github.io/RegulexPlus/>

Click a chip at the top to load a preset: `email` · `phone` · `url` · `iso-date` · a long Chinese in-car navigation regex.

## Run Locally

```bash
git clone https://github.com/PipeDream941/RegulexPlus.git
cd RegulexPlus
python -m http.server -d docs 8000
# open http://localhost:8000
```

You can also open `docs/index.html` directly, but a static server is recommended for consistent SVG behavior across browsers.

## Repository Layout

| Path | Description |
| --- | --- |
| `docs/index.html` | Deployed entry point; GitHub Pages source |
| `src/` | TypeScript source |
| `test/` | Tests and benchmarks |

## Credits

Forked from [CJex/regulex](https://github.com/CJex/regulex) (original author jex.im). RegulexPlus adds UI modernization, CJK rendering fixes, working PNG export, i18n, and more.

## License

[MIT](LICENSE)
