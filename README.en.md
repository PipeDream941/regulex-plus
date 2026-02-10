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