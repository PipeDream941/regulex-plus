# Regulex-Plus

中文 | [EN](README.en.md)

## 项目简介

Regulex-Plus 是 Regulex 的维护分支，用于正则表达式解析与可视化（railroad 风格图）。

### 项目状态

该分支聚焦于对遗留前端打包产物的实用修复与兼容性改进。

### 最近优化

#### 1. 中文/Unicode 显示优化

问题：
- 图中标签会把中文等可打印 Unicode 字符显示成转义序列（例如 `\u4F60\u597D`）。

修复：
- 在 `docs/index.html` 中对 `Kit.toPrint` 进行运行时覆盖。
- 保持可打印 Unicode 原样显示。
- 仍然转义不安全字符：
  - C0/C1 控制字符（`0x00-0x1F`, `0x7F-0x9F`）
  - 行分隔符（`0x2028`, `0x2029`）
  - 零宽/不可见字符（`0x200B`, `0x200C`, `0x200D`, `0xFEFF`）
  - 非法代理项（`0xD800-0xDFFF`）

结果：
- 图中中文直接显示，不再出现 Unicode 转义。

#### 2. 中英混排布局宽度修复

问题：
- 开启中文原样显示后，顶部 `RegExp:` 标题与部分标签出现挤压或重叠。

修复：
- 在内联 `visualize` 逻辑中加入 Unicode 宽度估算。
- 把基于 `.length` 的宽度计算替换为按字符宽度估算的逻辑。

结果：
- 混合 ASCII + 中文的文本间距稳定。

### 快速开始

#### 本地运行

直接用浏览器打开 `docs/index.html`，或用静态服务器启动仓库根目录。

#### 示例正则

- `^(a|你好)*?$`
- `[汉字]+`

### 仓库结构

- `docs/index.html`: 单文件运行时（主要目标）
- `src/`: TypeScript 源码
- `test/`: 测试与基准

### 许可证

MIT

## 原始 Regulex README（保留）

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
