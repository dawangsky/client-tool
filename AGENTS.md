
# 项目开发约定（fund-mac）

**开发以 `openspec/` 为准。** 实现路由、页面与 API 前请先阅读 OpenSpec；`contracts/` 跟随后端同步，勿擅自改路径语义。桌面视觉见 `openspec/specs/desktop-ui.md`。详见 `README.md`。

## 沟通语言（必须）

- **与用户、issue 评论、进度汇报：尽可能使用简体中文。**
- 代码标识符、API 路径、类名/文件名可保持英文；面向人的说明、README、错误提示优先中文。

## 技术栈

Tauri 2 + Rust + Vue 3 + TypeScript + Vite + Vue Router + Pinia。
