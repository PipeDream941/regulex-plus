# Regulex-Plus

Regulex-Plus is a maintained fork of Regulex, a JavaScript regular expression parser and visualizer.

## Project Status

This fork focuses on practical fixes for a legacy front-end bundle workflow.

## Recent Optimizations

### 1. Printable Unicode / Chinese Display

Problem:
- Diagram labels rendered Chinese and other printable Unicode characters as escaped sequences like `\u4F60\u597D`.

Fix:
- Added a runtime override for `Kit.toPrint` in `docs/index.html`.
- Keep printable Unicode characters as-is.
- Continue escaping unsafe characters:
  - C0/C1 controls (`0x00-0x1F`, `0x7F-0x9F`)
  - line separators (`0x2028`, `0x2029`)
  - zero-width/invisible chars (`0x200B`, `0x200C`, `0x200D`, `0xFEFF`)
  - isolated surrogate code units (`0xD800-0xDFFF`)

Result:
- Chinese text is rendered directly in graph labels.

### 2. Mixed CJK Width Layout Fix

Problem:
- After enabling direct Chinese rendering, some header/label text in the graph became visually compressed or overlapped.

Fix:
- Added Unicode-aware width calculation in the bundled `visualize` logic in `docs/index.html`.
- Replaced affected `.length`-based width calculations with code-point-aware visual width estimation.

Result:
- Layout spacing is stable for mixed ASCII + Chinese content.

## Quick Start

### Run Locally

Open `docs/index.html` in a browser, or serve the repo root as static files.

### Example Regex

- `^(a|你好)*?$`
- `[汉字]+`

## Install (Node.js)

```bash
npm install regulex
```

## API (Legacy)

### Parse to AST

```javascript
var parse = require("regulex").parse;
var re = /var\s+([a-zA-Z_]\w*);/;
console.log(parse(re.source));
```

### Visualize

```javascript
var parse = require("regulex").parse;
var visualize = require("regulex").visualize;
var Raphael = require("regulex").Raphael;

var re = /var\s+([a-zA-Z_]\w*);/;
var paper = Raphael("yourSvgContainerId", 0, 0);

try {
  visualize(parse(re.source), getRegexFlags(re), paper);
} catch (e) {
  if (e instanceof parse.RegexSyntaxError) {
    logError(re, e);
  } else {
    throw e;
  }
}
```

## Repository Layout

- `docs/index.html`: deployed single-file runtime bundle
- `src/`: TypeScript source code
- `test/`: tests and benchmarks

## License

MIT
