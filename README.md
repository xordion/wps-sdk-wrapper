# WPS SDK Wrapper

[English](README.md) | [中文](README.zh-CN.md)

Framework-agnostic wrapper for WPS WebOffice SDK.

---

## Bundled WPS SDK

This package bundles **WPS WebOffice SDK v2.0.6** (`web-office-sdk-solution-v2.0.6.es.js`).  
No separate SDK installation is required.

---

## Overview

`wps-sdk-wrapper` provides a stable, typed utility layer for WPS WebOffice integrations.  
It helps you initialize WebOffice, manage revisions, search/replace text, and apply formatting in React, Vue, or vanilla JavaScript projects.

---

## Features

- Framework-agnostic, pure TypeScript implementation
- Built-in WPS WebOffice SDK runtime (v2.0.6)
- Rich document utilities (search, locate, replace, insert)
- Revision-oriented helpers and change coloring
- Clear module boundaries and reusable APIs

---

## Installation

```bash
npm install wps-sdk-wrapper
```

---

## Required Credentials

Before calling `initWPS`, prepare:

- `appId`: assigned by WPS WebOffice console
- `fileId`: target file identifier
- `token`: access token returned/validated by your backend process

> Do not hardcode real tokens in source code or README examples.

---

## Quick Start

### 1) Import

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

### 2) Initialize

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

### 3) Save Document

```ts
await saveDocument(result.wps);
```

---

## Public API

This list follows the package root export (`index.ts`).

### Core (`core.ts`)

Recommended:

- `initWPS(options)`
- `saveDocument(wps)`
- `getWPSApplication(wps)`
- `setDocumentReadOnly(wps, isReadOnly)`

### Highlight (`highlight.ts`)

Recommended:

- `clearHitHighlight(app)`
- `highlightByRange(app, pos, length)`
- `coloredOnChange(wps, color?)`

Deprecated (not recommended):

- `highlightText(app, pos, length)` -> use `highlightByRange`

### Search (`search.ts`)

Recommended:

- No new recommended root API in this module. Prefer match module helpers.

Deprecated (not recommended):

- `searchAndLocateText(app, query)` -> use `queryTopMatches` / `navigateTopMatch`

### Match (`match.ts`)

Recommended:

- `getSelectionState(app)`
- `navigateTopMatch({ app, keyword, direction, currentMatchIndex, previousMatchesLength, ... })`
- `selectMatchRange(app, match)`

Deprecated (not recommended):

- `textPosToWpsPos(app, textPos)`
- `queryTopMatches(app, keyword, precision?)`
- `computeNextMatchIndex(input)`

### Text (`text.ts`)

Recommended:

- `handleInsertText(app, { text?, insert })`

Deprecated (not recommended):

- `insertTextAtCursor(app, text)` -> use `handleInsertText(app, { insert })`
- `replaceOriginalContent(app, origin, replace, pos, len, isHighlight?)` -> use `handleInsertText`

### Revisions (`revisions.ts` / `common.ts`)

Recommended:

- `collectRevisionInfos(revisions)`
- `getLatestRevisionDate(app)`
- `getRevisionCount(app)`
- `handleRevisionContent(app, date, isReject?)`
- `collectNewRevisionDatesAfter(app, countBefore)`
- `cancelRevisions(app, dates)`
- `toggleRevisionHandler(app, isShow)`

Deprecated (not recommended):

- `getRevisionByDate(app, date?)` -> use `handleRevisionContent` / `cancelRevisions`
- `handleMatchingRevisions(revisions, type?)` -> use `cancelRevisions` / `handleRevisionContent`

### Formatting (`formatting.ts`)

Recommended:

- `clearAllText(app)`
- `formatDocumentFont(app, font)`

Deprecated (not recommended):

- `getDocLength(app)` -> internal compatibility helper

### Utils (`utils.ts`)

Deprecated (not recommended):

- `generateRandomString(length, includeUpperCase?, includeLowerCase?)` -> internal compatibility helper

Type exports:

- `Wps`
- `WpsApplication`
- `WpsToken`
- `WpsOptions`
- `WpsCommandBar`
- `WpsInitParams`
- `SearchMatchRange`

---

## Security Checklist

For publishing or open-source release, verify:

- No real `token`, `appId`, `fileId`, or internal URLs in code/docs
- No `.env*` files committed
- No private key/certificate files (`.pem`, `.key`, `.p12`, `.pfx`, `.jks`, etc.)
- No registry auth tokens in `.npmrc`
- No personal/private emails exposed unless intentionally public

---

## Development

```bash
npm run dev
npm run build
npm run prepublishOnly
```

---

## Contributing

Issues and pull requests are welcome.

---

## License

MIT
