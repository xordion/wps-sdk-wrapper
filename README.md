# WPS SDK Wrapper

一个框架无关的 WPS WebOffice SDK 封装库，配合wps前端应用，提供完整的 WPS weboffice 文档编辑、修订管理和文本操作功能。可在 React、Vue、Angular 或原生 JavaScript 等任何技术栈中使用。

## ✨ 特性

- 🎯 **完整的 WPS 集成** - 基于 WPS WebOffice SDK v2.0.6，SDK 已内置打包
- 🔧 **框架无关** - 纯 JavaScript/TypeScript 实现，支持所有技术栈
- 🔧 **模块化设计** - 按功能拆分模块，支持按需导入
- 🎨 **修订着色** - 实时为修订内容添加颜色标记
- 📝 **文档操作** - 搜索、定位、替换、插入等完整功能
- 🛡️ **类型安全** - 完整的 TypeScript 类型定义
- ⚡ **零循环依赖** - 优化的模块依赖结构

## 📦 安装

```bash
npm install wps-sdk-wrapper
```

## 🔑 获取认证信息

在使用本库之前，您需要已经获取以下认证信息：

- **appId** - 应用ID，由 **WPS weboffice控制台** 分配
- **fileId** - 文件ID
- **token** - 访问令牌，由接入方自定义, WebOffice 将会在回调接口时通过 X-Weboffice-Token 的 Header 字段回传，可用于检查鉴权

> 💡 **提示**：这些认证信息是访问WPS文档服务的必需参数，请联系WPS中台管理员获取。

## 🚀 使用方式

### 导入工具方法

```javascript
// ES Module 方式
import { 
  initWPS, 
  saveDocument, 
  getWPSApplication,
  searchAndLocateText,
  insertTextAtCursor,
  coloredOnChange
} from 'wps-sdk-wrapper';

// CommonJS 方式
const { initWPS, saveDocument } = require('wps-sdk-wrapper');
```

### 基本用法（原生 JavaScript）

```html
<!DOCTYPE html>
<html>
<head>
  <title>WPS SDK Wrapper 示例</title>
</head>
<body>
  <div id="wps-container" style="width: 100%; height: 600px;"></div>
  <button id="save-btn">保存文档</button>

  <script type="module">
    import { initWPS, saveDocument, coloredOnChange } from 'wps-sdk-wrapper';

    let wpsInstance = null;
    let appInstance = null;
    let clearListener = null;

    // 从WPS中台获取的认证信息
    const appId = 'your-app-id';      // 由WPS中台提供
    const fileId = 'your-file-id';    // 由WPS中台提供
    const token = 'your-token';       // 由WPS中台提供

    const handleReady = (wps, app) => {
      wpsInstance = wps;
      appInstance = app;
      
      // 启用修订内容着色
      clearListener = coloredOnChange(wps, '#ff0000');
      console.log('WPS 初始化完成');
    };

    const handleError = (error) => {
      console.error('WPS 初始化失败', error);
    };

    // 初始化WPS
    (async () => {
      try {
        const result = await initWPS({
          fileId: fileId,
          appId: appId,
          fileName: 'example.doc',
          containerSelector: '#wps-container',
          token: token,
          isReadOnly: false,
          onReady: handleReady,
          onError: handleError
        });
        
        if (result) {
          console.log('WPS 初始化成功', result);
        }
      } catch (error) {
        console.error('初始化失败:', error);
      }
    })();

    // 保存文档
    document.getElementById('save-btn').addEventListener('click', async () => {
      if (wpsInstance) {
        await saveDocument(wpsInstance);
        console.log('文档保存成功');
      }
    });

    // 清理（页面卸载时）
    window.addEventListener('beforeunload', () => {
      if (clearListener) {
        clearListener();
      }
    });
  </script>
</body>
</html>
```

### React 使用示例

```jsx
import { useEffect, useRef } from 'react';
import { initWPS, coloredOnChange, saveDocument } from 'wps-sdk-wrapper';

function WpsEditor() {
  const wpsRef = useRef(null);
  const appRef = useRef(null);
  const clearListenerRef = useRef(null);

  useEffect(() => {
    // 从WPS中台获取的认证信息
    const appId = 'your-app-id';      // 由WPS中台提供
    const fileId = 'your-file-id';    // 由WPS中台提供
    const token = 'your-token';       // 由WPS中台提供

    const initializeWPS = async () => {
      try {
        const result = await initWPS({
          fileId: fileId,
          appId: appId,
          fileName: 'example.doc',
          containerSelector: '#wps-container',
          token: token,
          isReadOnly: false,
          onReady: (wps, app) => {
            wpsRef.current = wps;
            appRef.current = app;
            clearListenerRef.current = coloredOnChange(wps);
          },
          onError: (error) => {
            console.error('WPS 初始化失败', error);
          }
        });
      } catch (error) {
        console.error('初始化失败:', error);
      }
    };

    initializeWPS();

    return () => {
      if (clearListenerRef.current) {
        clearListenerRef.current();
      }
    };
  }, []);

  return <div id="wps-container" style={{ width: '100%', height: '600px' }}></div>;
}
```

### Vue 使用示例

```vue
<template>
  <div id="wps-container" style="width: 100%; height: 600px;"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { initWPS, coloredOnChange } from 'wps-sdk-wrapper';

const wpsRef = ref(null);
const clearListenerRef = ref(null);

onMounted(async () => {
  // 从WPS中台获取的认证信息
  const appId = 'your-app-id';      // 由WPS中台提供
  const fileId = 'your-file-id';    // 由WPS中台提供
  const token = 'your-token';       // 由WPS中台提供

  try {
    const result = await initWPS({
      fileId: fileId,
      appId: appId,
      fileName: 'example.doc',
      containerSelector: '#wps-container',
      token: token,
      isReadOnly: false,
      onReady: (wps, app) => {
        wpsRef.value = wps;
        clearListenerRef.value = coloredOnChange(wps);
      },
      onError: (error) => {
        console.error('WPS 初始化失败', error);
      }
    });
  } catch (error) {
    console.error('初始化失败:', error);
  }
});

onUnmounted(() => {
  if (clearListenerRef.value) {
    clearListenerRef.value();
  }
});
</script>
```

## 📋 可用的工具方法

### 🔧 核心功能 (core.ts)

- `initWPS(options)` - 初始化 WPS 实例
- `saveDocument(wps)` - 保存文档
- `getWPSApplication(wps)` - 获取 WPS 应用程序实例
- `setDocumentReadOnly(wps, isReadOnly)` - 设置文档只读状态

### 🎨 高亮和颜色操作 (highlight.ts)

- `clearHitHighlight(app)` - 清除文本高亮
- `highlightText(app, pos, length)` - 高亮指定位置文本
- `highlightByRange(app, pos, length)` - 按范围高亮文本
- `coloredOnChange(wps, color?)` - 启用修订内容着色监听 ⭐
- `coloringTextByRange(app, {start, end}, color?)` - 为指定范围文本着色
- `setInputColor(app, color)` - 设置输入文本颜色

### 🔍 搜索和定位 (search.ts)

- `searchAndLocateText(app, content, isLocate?)` - 搜索并定位文本

### ✏️ 文本操作 (text.ts)

- `insertTextAtCursor(app, text)` - 在光标位置插入文本
- `replaceOriginalContent(app, origin, replace, pos, len, isHighlight?)` - 替换原文内容

### 📝 修订管理 (revisions.ts)

- `getLatestRevisionDate(app)` - 获取最新修订时间
- `collectRevisionInfos(revisions)` - 收集修订信息
- `getRevisionByDate(app, date)` - 根据日期获取修订信息
- `handleMatchingRevisions(revisions, type)` - 批量处理修订（接受/拒绝）
- `handleRevisionContent(app, date, isReject?)` - 处理修订内容

### 🎯 格式化操作 (formatting.ts)

- `getDocLength(app)` - 获取文档字数
- `formatDocumentFont(app, font)` - 格式化文档字体

### 🛠️ 工具函数 (utils.ts)

- `generateRandomString(length, includeUpperCase?, includeLowerCase?)` - 生成随机字符串

### 📊 公共类型 (common.ts)

- `RevisionInfo` - 修订信息接口
- `delay(ms)` - 延迟执行工具函数

## 🌟 功能示例

### 修订内容实时着色

```javascript
import { coloredOnChange } from 'wps-sdk-wrapper';

// 在 WPS 初始化完成后启用
const clearListener = coloredOnChange(wps, '#ff0000'); // 可选择颜色，默认蓝色

// 功能：
// 1. 监听文档变化，自动为最新修订内容着色
// 2. 设置输入文本的默认颜色
// 3. 返回清理函数，用于取消监听

// 清理监听器
clearListener();
```

### 文本搜索和定位

```javascript
import { searchAndLocateText } from 'wps-sdk-wrapper';

// 搜索文本并定位到第一个匹配位置
const result = await searchAndLocateText(app, '要搜索的文本', true);
if (result) {
  console.log(`找到文本，位置: ${result.pos}，长度: ${result.len}，共 ${result.totalMatches} 处匹配`);
}
```

### 在光标处插入文本

```javascript
import { insertTextAtCursor } from 'wps-sdk-wrapper';

// 在文档光标当前位置插入文本
const success = await insertTextAtCursor(app, '要插入的文本');
if (success) {
  console.log('文本插入成功');
}
```

### 文本替换并高亮

```javascript
import { replaceOriginalContent } from 'wps-sdk-wrapper';

// 替换文本并可选择是否高亮
await replaceOriginalContent(
  app,           // WPS 应用实例
  '原文内容',     // 要替换的原文
  '新文内容',     // 替换后的文本
  startPos,      // 开始位置
  length,        // 长度
  true          // 是否高亮新文本
);
```

## 💡 设计优势

1. **🌐 框架无关** - 纯 JavaScript/TypeScript 实现，可在任何技术栈中使用
2. **📦 SDK 内置** - WPS SDK v2.0.6 已打包，无需额外配置
3. **🏗️ 模块化架构** - 按功能拆分，避免循环依赖
4. **📦 按需导入** - 支持按需导入，减少打包体积
5. **🔒 类型安全** - 完整的 TypeScript 类型定义
6. **⚡ 性能优化** - 优化的事件监听和清理机制
7. **🛡️ 容错处理** - 完善的错误处理和边界情况考虑

## ⚠️ 重要说明

### 认证信息获取

- **appId**、**fileId** 和 **token** 必须从 **WPS 中台** 获取
- 这些信息是访问 WPS 文档服务的必需参数
- 请联系您的 WPS 中台管理员或技术支持获取相关认证信息

### 技术栈支持

本库是纯 JavaScript/TypeScript 实现，不依赖任何前端框架，可以在以下技术栈中使用：

- ✅ 原生 JavaScript
- ✅ React
- ✅ Vue
- ✅ Angular
- ✅ 其他任何支持 ES Module 或 CommonJS 的环境

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来完善这个库！

## 📄 许可证

MIT License