---
name: regulex-plus
description: Visualize a JavaScript regular expression as a railroad diagram (PNG or SVG) by shelling out to the `regulex-plus` CLI. Use whenever the user asks to explain, debug, understand, optimize, or document a regex — especially complex patterns with quantifiers, lookarounds, alternations, or CJK/Chinese characters — and also proactively after you yourself generate or modify a non-trivial regex, so the user can verify it visually.
---

# regulex-plus

Render any JavaScript regex as a railroad diagram saved to a local image file. Wraps the regulex-plus web visualizer in a headless-browser CLI, so it works in any Node environment without manual screenshots.

## When to use

Invoke this skill when **any** of the following holds:

- The user asks to **explain / understand / 解释 / 看懂** a regex.
- The user is **debugging or optimizing** a regex and would benefit from a structural view.
- The regex contains **CJK characters / 中文** — regulex-plus has native CJK width handling that generic visualizers lack.
- The regex has **alternations, nested groups, lookarounds, backreferences, or non-trivial quantifiers** that are hard to read inline.
- You (Claude) just **generated or rewrote a regex** in a code change — offer the user a visual to confirm intent.

Skip it for one-token patterns (e.g. `\d+`, `^$`) — overhead isn't worth it.

## How to invoke

The CLI is `regulex-plus` (installed when this skill's package is added). Use Bash:

```bash
# Minimal — PNG to ./regulex.png
npx regulex-plus '<pattern>'

# Pick output path; format inferred from extension
npx regulex-plus '<pattern>' --out ./diagrams/email.png
npx regulex-plus '<pattern>' --out ./diagrams/email.svg

# Add flags, theme, language
npx regulex-plus '<pattern>' --flags ig --theme dark --lang en --out out.png
```

**Argument tips:**

- Wrap the pattern in **single quotes** in zsh/bash so `\`, `$`, `(`, `|` don't get shell-expanded. For patterns containing single quotes, use `--regex` with a heredoc-style here-string or escape carefully.
- `--flags` takes the flag letters concatenated, e.g. `ig`, not `--flags i --flags g`.
- `--theme dark` produces a dark-background diagram nice for terminals; default `light` is better for white docs.
- `--lang zh` keeps node labels in Chinese (matches Chinese-regex context); `--lang en` for English docs.
- Default output is `./regulex.png` if `--out` is omitted.

The CLI prints the absolute output path on success and exits non-zero on regex parse errors (with the error message on stderr).

## After rendering

1. **Show the file to the user.** Reference it as `file_path:1` so the editor can open it, or paste the path so they can preview. If they're chatting in a UI that renders images inline (Claude Code, ChatGPT-style), the diagram appears automatically when you `Read` it.
2. **Walk through it briefly** — point out the alternation branches, the quantifier ranges, and any non-obvious structure the diagram makes explicit (e.g. that `a|bc` is `a` OR `bc`, not `(a|b)c`).
3. **If the regex came from your own generation**, ask the user to confirm the visualization matches their intent before merging code that depends on it.

## Composing with other skills

regulex-plus only draws the *structure* of a pattern. For richer explanations, combine:

- **Mermaid / flowchart skills** — after showing the railroad diagram, render the *runtime matching flow* of the regex against a sample input as a Mermaid flowchart (state machine view). Useful for backtracking / catastrophic-backtracking discussions.
- **Code-explain / docs skills** — embed the generated PNG in the function's docstring or in the PR description; the visual reduces review friction.
- **Test-generation skills** — once the diagram is correct, derive positive/negative test strings from each branch.

Do *not* duplicate work: if a sibling skill already produces a regex visualization (some Mermaid presets do basic state diagrams), prefer the more specialized output of regulex-plus for actual railroad structure, and let the other skill handle the flow/state aspect.

## Error handling

| Symptom | Likely cause | Fix |
|---|---|---|
| `regex error: ...` non-zero exit | Invalid JS regex syntax | Show the user the parser error verbatim — it includes a `^` caret pointing at the offending char |
| `Timeout 10000ms exceeded` | First-run chromium download not finished, or page failed to load | Run `npx playwright install chromium` once, then retry. Bump `--timeout 30000` for slow networks |
| PNG saved but theme CSS missing | Standalone SVG vs page-styled view | Use `--format png` (themed) rather than `--format svg` (raw Raphaël markup) when you need the styled look |
| `--flags` ignored | DOM flag toggles haven't been wired up yet (best-effort) | Encode the flags directly in the pattern using inline modifiers, or fall back to omitting `--flags` |

## What this skill does NOT do

- It does **not** validate that the regex matches a particular input — use Node's own `RegExp` for that.
- It does **not** convert between regex flavors (PCRE ↔ JS) — input must be valid JavaScript regex syntax.
- It does **not** generate regex *from* a description — pair with a regex-generation skill upstream.
- It does **not** run in environments without Chromium (e.g. some sandboxed CI without GUI libs) — fail loudly there rather than fall back.

## Source & feedback

Repo: <https://github.com/PipeDream941/regulex-plus>  ·  Demo: <https://pipedream941.github.io/regulex-plus/>

Issues with rendering, CJK width, or CLI ergonomics: open at the repo.
