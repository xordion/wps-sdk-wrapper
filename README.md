# WPS SDK Wrapper

Framework-agnostic wrapper for WPS WebOffice SDK.  
一个框架无关的 WPS WebOffice SDK 封装库。

---

## Overview | 项目简介

**English**

`wps-sdk-wrapper` provides a stable, typed utility layer for WPS WebOffice integrations.  
It helps you initialize WebOffice, manage revisions, search/replace text, and apply formatting in React, Vue, or vanilla JavaScript projects.

**中文**

`wps-sdk-wrapper` 为 WPS WebOffice 提供统一且类型安全的工具层。  
可用于初始化 WebOffice、修订处理、文本搜索替换、格式化等能力，适配 React、Vue 与原生 JavaScript 项目。

---

## Features | 特性

- Framework-agnostic, pure TypeScript implementation | 框架无关，纯 TypeScript 实现
- Built-in WPS WebOffice SDK runtime | 内置 WPS WebOffice SDK 运行时
- Rich document utilities (search, locate, replace, insert) | 完整文档工具（搜索、定位、替换、插入）
- Revision-oriented helpers and change coloring | 修订管理与变更着色能力
- Clear module boundaries and reusable APIs | 模块边界清晰，API 易复用

---

## Installation | 安装

```bash
npm install wps-sdk-wrapper
```

---

## Required Credentials | 必要认证参数

Before calling `initWPS`, prepare:

- `appId`: assigned by WPS WebOffice console
- `fileId`: target file identifier
- `token`: access token returned/validated by your backend process

调用 `initWPS` 前，你需要准备：

- `appId`：由 WPS WebOffice 控制台分配
- `fileId`：目标文件 ID
- `token`：由你的后端签发/校验的访问令牌

> Do not hardcode real tokens in source code or README examples.  
> 请勿在源码或 README 示例中硬编码真实 token。

---

## Quick Start | 快速开始

### 1) Import | 导入

```ts
import {
  initWPS,
  saveDocument,
  getWPSApplication,
  searchAndLocateText,
  insertTextAtCursor,
  coloredOnChange,
} from "wps-sdk-wrapper";
```

### 2) Initialize | 初始化

```ts
const result = await initWPS({
  appId: "your-app-id",
  fileId: "your-file-id",
  fileName: "example.docx",
  token: "your-token",
  containerSelector: "#wps-container",
  isReadOnly: false,
  onReady: (wps, app) => {
    // optional: color newly changed content
    coloredOnChange(wps, "#ff0000");
    console.log("WPS ready", { wps, app });
  },
  onError: (error) => {
    console.error("WPS init failed", error);
  },
});

console.log("init result", result);
```

### 3) Save Document | 保存文档

```ts
await saveDocument(result.wps);
```

---

## Public API | 对外 API

This list follows the package root export (`index.ts`).
下列方法以包入口导出（`index.ts`）为准。

- `initWPS(options)`
- `saveDocument(wps)`
- `getWPSApplication(wps)`
- `setDocumentReadOnly(wps, isReadOnly)`
- `clearHitHighlight(app)`
- `clearAllText(app)`
- `collectRevisionInfos(revisions)`
- `getLatestRevisionDate(app)`
- `getRevisionCount(app)`
- `handleRevisionContent(app, date, isReject?)`
- `collectNewRevisionDatesAfter(app, baseDate)`
- `cancelRevisions(app, revisionIds)`
- `handleInsertText(app, text, options?)`
- `getSelectionState(app)`
- `navigateTopMatch(app, direction, options?)`
- `formatDocumentFont(app, font)`
- `coloredOnChange(wps, color?)`
- `toggleRevisionHandler(wps, enabled)`

Type exports:
类型导出：

- `Wps`
- `WpsApplication`
- `WpsToken`
- `WpsOptions`
- `WpsCommandBar`
- `WpsInitParams`
- `SearchMatchRange`

---

## Security Checklist | 脱敏检查清单

For publishing or open-source release, verify:

- No real `token`, `appId`, `fileId`, or internal URLs in code/docs
- No `.env*` files committed
- No private key/certificate files (`.pem`, `.key`, `.p12`, `.pfx`, `.jks`, etc.)
- No registry auth tokens in `.npmrc`
- No personal/private emails exposed unless intentionally public

用于发布或开源前，请确认：

- 代码和文档中没有真实 `token`、`appId`、`fileId`、内部域名
- 未提交 `.env*` 文件
- 未提交私钥/证书文件（`.pem`、`.key`、`.p12`、`.pfx`、`.jks` 等）
- `.npmrc` 中没有 registry 鉴权 token
- 未暴露不应公开的个人邮箱

---

## Development | 开发

```bash
npm run dev
npm run build
npm run prepublishOnly
```

---

## Contributing | 贡献

Issues and pull requests are welcome.  
欢迎提交 Issue 与 Pull Request。

---

## License | 许可证

MIT