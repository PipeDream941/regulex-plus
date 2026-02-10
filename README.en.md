# Regulex-Plus

[中文](README.md) | EN

## Project Overview

Regulex-Plus is a maintained fork of Regulex for parsing and visualizing regular expressions with a railroad-style graph.

### Project Status

This fork focuses on pragmatic fixes for a legacy, bundled front-end workflow.

### Recent Optimizations

#### 1. Printable Unicode / Chinese Display

Problem:
- Diagram labels rendered Chinese and other printable Unicode characters as escaped sequences (for example `\u4F60\u597D`).

Fix:
- Added a runtime override for `Kit.toPrint` in `docs/index.html`.
- Kept printable Unicode characters as-is.
- Continued escaping unsafe characters:
  - C0/C1 controls (`0x00-0x1F`, `0x7F-0x9F`)
  - line separators (`0x2028`, `0x2029`)
  - zero-width/invisible chars (`0x200B`, `0x200C`, `0x200D`, `0xFEFF`)
  - isolated surrogate code units (`0xD800-0xDFFF`)

Result:
- Chinese text is displayed directly in graph labels.

#### 2. Mixed CJK Width Layout Fix

Problem:
- After enabling direct Chinese rendering, some header/label text became compressed or overlapped.

Fix:
- Added Unicode-aware width estimation in the bundled `visualize` logic.
- Replaced `.length`-based width calculations with visual width estimation.

Result:
- Layout spacing is stable for mixed ASCII + Chinese content.

### Quick Start

#### Run Locally

Open `docs/index.html` in a browser, or serve the repo root as static files.

#### Example Regex

- `^(a|你好)*?$`
- `[汉字]+`

### Repository Layout

- `docs/index.html`: deployed single-file runtime bundle
- `src/`: TypeScript source code
- `test/`: tests and benchmarks

### License

MIT

## Original Regulex README (Preserved)

Regulex
Regulex is a JavaScript Regular Expression Parser & Visualizer.

Try it now: https://jex.im/regulex/

This project is under reconstruction!

### Features

- Written in pure JavaScript. No backend required.
- You can embed the graph on you own site through HTML iframe element.
- Detailed error message. In most cases it can point out the precise syntax error position.
- No support for octal escape. Yes it is a feature! ECMAScript strict mode doesn't allow octal escape in string, but many browsers still allow octal escape in regex. In regulex, DecimalEscape will always be treated as back reference. If the back reference is invalid, e.g. `/\1/`, `/(\1)/`, `/(a)\2/`, or DecimalEscape appears in charset（because in this case it can't be explained as back reference, e.g. `/(ab)[\1]/`, Regulex will always throw an error.

### Install for Node.js

```bash
npm install regulex
```

### Local Build for Browser

This command will generate bundle `dist/regulex.js` for browser side:

```bash
git checkout legacy
npm install -g requirejs
r.js -o build-config.js
```

### API

Parse to AST

```js
var parse = require("regulex").parse;
var re = /var\s+([a-zA-Z_]\w*);/ ;
console.log(parse(re.source));
```

Visualize

```js
var parse = require("regulex").parse;
var visualize = require("regulex").visualize;
var Raphael = require('regulex').Raphael;
var re = /var\s+([a-zA-Z_]\w*);/;
var paper = Raphael("yourSvgContainerId", 0, 0);
try {
  visualize(parse(re.source), getRegexFlags(re), paper);
} catch(e) {
  if (e instanceof parse.RegexSyntaxError) {
    logError(re, e);
  } else {
    throw e;
  }
}

function logError(re, err) {
  var msg = ["Error:" + err.message, ""];
  if (typeof err.lastIndex === "number") {
    msg.push(re);
    msg.push(new Array(err.lastIndex).join("-") + "^");
  }
  console.log(msg.join("\n"));
}

function getRegexFlags(re) {
  var flags = "";
  flags += re.ignoreCase ? "i" : "";
  flags += re.global ? "g" : "";
  flags += re.multiline ? "m" : "";
  return flags;
}
```
