# WPS SDK Wrapper

[English](README.md) | [中文](README.zh-CN.md)

一个框架无关的 WPS WebOffice SDK 封装库。

---

## 内置 WPS SDK

本包内置 **WPS WebOffice SDK v2.0.6**（`web-office-sdk-solution-v2.0.6.es.js`）。  
无需单独安装 SDK。

---

## 项目简介

`wps-sdk-wrapper` 为 WPS WebOffice 提供统一且类型安全的工具层。  
可用于初始化 WebOffice、修订处理、文本搜索替换、格式化等能力，适配 React、Vue 与原生 JavaScript 项目。

---

## 特性

- 框架无关，纯 TypeScript 实现
- 内置 WPS WebOffice SDK 运行时（v2.0.6）
- 完整文档工具（搜索、定位、替换、插入）
- 修订管理与变更着色能力
- 模块边界清晰，API 易复用

---

## 安装

```bash
npm install wps-sdk-wrapper
```

---

## 必要认证参数

调用 `initWPS` 前，你需要准备：

- `appId`：由 WPS WebOffice 控制台分配
- `fileId`：目标文件 ID
- `token`：由你的后端签发/校验的访问令牌

> 请勿在源码或 README 示例中硬编码真实 token。

---

## 快速开始

### 1) 导入

```ts
import {
  initWPS,
  saveDocument,
  navigateTopMatch,
  handleInsertText,
  formatSearchTextForDocMatch,
  coloredOnChange,
} from "wps-sdk-wrapper";
```

### 2) 初始化

```ts
const result = await initWPS({
  appId: "your-app-id",
  fileId: "your-file-id",
  fileName: "example.docx",
  token: "your-token",
  containerSelector: "#wps-container",
  isReadOnly: false,
  onReady: (wps, app) => {
    // 可选：对新变更内容着色
    coloredOnChange(wps, "#ff0000");
    console.log("WPS ready", { wps, app });
  },
  onError: (error) => {
    console.error("WPS init failed", error);
  },
});

console.log("init result", result);
```

### 3) 保存文档

```ts
await saveDocument(result.wps);
```

### 4) 规范化搜索 / 插入文本

```ts
const keyword = formatSearchTextForDocMatch("1. 付款条款");
const { matches } = await navigateTopMatch({
  app: result.app,
  keyword,
  direction: "next",
  currentMatchIndex: 0,
  previousMatchesLength: 0,
});

await handleInsertText(result.app, {
  insert: formatSearchTextForDocMatch("（1）更新后的付款条款"),
});
```

---

## 对外 API

下列方法以包入口导出（`index.ts`）为准。

### Core (`core.ts`)

推荐：

- `initWPS(options)`
- `saveDocument(wps)`
- `getWPSApplication(wps)`
- `setDocumentReadOnly(wps, isReadOnly)`

### Highlight (`highlight.ts`)

推荐：

- `clearHitHighlight(app)`
- `highlightByRange(app, pos, length)`
- `coloredOnChange(wps, color?)`

已废弃（不推荐）：

- `highlightText(app, pos, length)` -> 请使用 `highlightByRange`

### Search (`search.ts`)

推荐：

- 当前模块没有新增推荐的根导出接口，请优先使用 match 模块能力。

已废弃（不推荐）：

- `searchAndLocateText(app, query)` -> 请使用 `queryTopMatches` / `navigateTopMatch`

### Match (`match.ts`)

推荐：

- `getSelectionState(app)`
- `navigateTopMatch({ app, keyword, direction, currentMatchIndex, previousMatchesLength, ... })`
- `selectMatchRange(app, match)`

已废弃（不推荐）：

- `textPosToWpsPos(app, textPos)`
- `queryTopMatches(app, keyword, precision?)`
- `computeNextMatchIndex(input)`

### Text (`text.ts`)

推荐：

- `handleInsertText(app, { text?, insert })`

已废弃（不推荐）：

- `insertTextAtCursor(app, text)` -> 请使用 `handleInsertText(app, { insert })`
- `replaceOriginalContent(app, origin, replace, pos, len, isHighlight?)` -> 请使用 `handleInsertText`

### Revisions (`revisions.ts` / `common.ts`)

推荐：

- `collectRevisionInfos(revisions)`
- `getLatestRevisionDate(app)`
- `getRevisionCount(app)`
- `handleRevisionContent(app, date, isReject?)`
- `collectNewRevisionDatesAfter(app, countBefore)`
- `cancelRevisions(app, dates)`
- `toggleRevisionHandler(app, isShow)`

已废弃（不推荐）：

- `getRevisionByDate(app, date?)` -> 请使用 `handleRevisionContent` / `cancelRevisions`
- `handleMatchingRevisions(revisions, type?)` -> 请使用 `cancelRevisions` / `handleRevisionContent`

### Formatting (`formatting.ts`)

推荐：

- `clearAllText(app)`
- `formatDocumentFont(app, font)`
- `formatSearchTextForDocMatch(input)`

已废弃（不推荐）：

- `getDocLength(app)` -> 内部兼容辅助函数

### Utils (`utils.ts`)

已废弃（不推荐）：

- `generateRandomString(length, includeUpperCase?, includeLowerCase?)` -> 内部兼容辅助函数

类型导出：

- `Wps`
- `WpsApplication`
- `WpsToken`
- `WpsOptions`
- `WpsCommandBar`
- `WpsInitParams`
- `SearchMatchRange`

---

## 脱敏检查清单

用于发布或开源前，请确认：

- 代码和文档中没有真实 `token`、`appId`、`fileId`、内部域名
- 未提交 `.env*` 文件
- 未提交私钥/证书文件（`.pem`、`.key`、`.p12`、`.pfx`、`.jks` 等）
- `.npmrc` 中没有 registry 鉴权 token
- 未暴露不应公开的个人邮箱

---

## 开发

```bash
npm run dev
npm run build
npm run prepublishOnly
```

---

## 贡献

欢迎提交 Issue 与 Pull Request。

---

## 许可证

MIT
