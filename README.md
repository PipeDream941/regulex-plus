# Regulex+

中文 | [EN](README.en.md)

> JavaScript 正则表达式解析与可视化工具 —— 现代化界面、原生中文支持、railroad 风格图

**🌐 在线试用：<https://pipedream941.github.io/regulex-plus/>**

无需安装、零后端，浏览器打开即用。

## 特性

- 🎨 **现代化 UI** —— 暗 / 亮双主题，DM Sans + JetBrains Mono，Tweaks 面板可调强调色与画布底色
- 🌏 **中英双语** —— 一键切换，所有 UI、提示、示例完整本地化
- 📐 **圆角 SVG 节点** —— 重做 Begin / End、量词、字符类节点的配色与圆角
- 🈯 **原生 Unicode / 中文** —— 图标签直接显示中文，不再渲染成 `你好` 转义
- 📏 **中英混排宽度修复** —— `visualize` 内部按字符可视宽度计算，避免标题挤压
- 🖼 **PNG 图片导出** —— 颜色与圆角内联到 SVG，2× DPR 高清下载
- 📦 **零后端依赖** —— 单文件 HTML，可通过 `<iframe>` 嵌入到任意页面

## 快速试用

直接打开线上 demo：<https://pipedream941.github.io/regulex-plus/>

页面顶部 chip 一键加载示例：`email` · `phone` · `url` · `iso-date` · 中文车机导航长正则。

## 本地运行

```bash
git clone https://github.com/PipeDream941/regulex-plus.git
cd regulex-plus
python -m http.server -d docs 8000
# 浏览器访问 http://localhost:8000
```

或者直接用浏览器打开 `docs/index.html`（部分浏览器对 `file://` 下的 SVG 行为不同，建议走静态服务器）。

## 命令行用法 / Claude Skill

通过 npm 安装后，可以在终端直接把任意 JS 正则渲染成 PNG/SVG 文件——无需打开浏览器。同时本仓库带有 `SKILL.md`，可作为 [Claude Code Skill](https://skills.sh/) 被 AI agent 自动调用。

```bash
# 最简单：渲染到 ./regulex.png
npx regulex-plus '^(a|b)*?$'

# 指定输出路径与格式（根据后缀自动判断）
npx regulex-plus '中文(标点|符号)+' --out diagrams/cjk.png
npx regulex-plus '\d{3}-\d{4}' --format svg --out phone.svg

# 暗色主题、英文标签、2× DPR
npx regulex-plus '(?:abc|def)+' --theme dark --lang en --scale 2 --out demo.png

# 完整选项
npx regulex-plus --help
```

首次运行会下载 Chromium（~92MB）；如果失败手动跑 `npx playwright install chromium`。

### 作为 Skill 安装

```bash
npx skills add PipeDream941/regulex-plus
```

之后任何兼容 skills 协议的 agent（如 Claude Code）在用户讨论复杂正则时会自动建议调用本 CLI 生成可视化。

## 仓库结构

| 路径 | 说明 |
| --- | --- |
| `docs/index.html` | 部署入口；GitHub Pages 来源 |
| `src/` | TypeScript 源码 |
| `test/` | 测试与基准 |

## 致谢

本项目 Fork 自 [CJex/regulex](https://github.com/CJex/regulex)（原作者 jex.im）。Regulex+ 在原项目基础上做了 UI 现代化、中文渲染修复、PNG 导出修复、i18n 等改进。

## 许可证

[MIT](LICENSE)
