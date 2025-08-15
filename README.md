# WPS SDK Wrapper

A **framework-agnostic** utility toolkit for WPS WebOffice SDK integration. Works seamlessly with React, Vue, Angular, or vanilla JavaScript.

一个**框架无关**的 WPS WebOffice SDK 工具库。可与 React、Vue、Angular 或原生 JavaScript 无缝配合使用。

## ✨ Features / 特性

- 🚀 **Framework Agnostic** - Works with any JavaScript framework or vanilla JS / **框架无关** - 可与任何 JavaScript 框架或原生 JS 配合使用
- 🛠️ **Rich Utilities** - Comprehensive toolkit for document operations / **丰富工具** - 提供全面的文档操作工具集
- 📝 **TypeScript Support** - Full TypeScript definitions included / **TypeScript 支持** - 包含完整的 TypeScript 类型定义
- 🎯 **Modern Development** - Built with modern JavaScript patterns / **现代开发** - 使用现代 JavaScript 模式构建
- 📦 **Tree Shaking** - Supports tree shaking for optimal bundle size / **Tree Shaking** - 支持 tree shaking，优化打包体积
- 🔧 **Zero Dependencies** - Core library has no framework dependencies / **零依赖** - 核心库无框架依赖

## 📦 Installation / 安装

```bash
npm install wps-sdk-wrapper
```

## 🛠️ Available Utilities / 可用工具方法

### Initialization / 初始化相关
- `initWPS` - Initialize WPS instance / 初始化 WPS 实例
- `getWPSApplication` - Get WPS application instance / 获取 WPS 应用程序实例
- `setDocumentReadOnly` - Set document read-only status / 设置文档只读状态

### Text Operations / 文本操作
- `searchAndLocateText` - Search and locate text in document / 搜索并定位文档中的文本
- `insertTextAtCursor` - Insert text at cursor position / 在光标位置插入文本
- `clearHitHighlight` - Clear text highlighting / 清除文本高亮
- `replaceOriginalContent` - Replace original content / 替换原始内容

### Document Management / 文档管理
- `saveDocument` - Save document / 保存文档
- `getDocLength` - Get document length / 获取文档长度
- `formatDocumentFont` - Format document font / 格式化文档字体

### Revision Management / 修订管理
- `getLatestRevisionDate` - Get latest revision date / 获取最新修订日期
- `collectRevisionInfos` - Collect revision information / 收集修订信息
- `handleMatchingRevisions` - Accept/reject matching revisions / 接受/拒绝匹配的修订
- `handleRevisionContent` - Handle revision content / 处理修订内容

## 📚 API Reference / API 参考

### initWPS Options

```typescript
interface InitWPSOptions {
  fileId: string;                    // 文件ID
  appId: string;                     // 应用ID
  containerSelector: string;         // 容器选择器
  onReady?: (wps: any, app: any) => void;     // 初始化完成回调
  onError?: (error: any) => void;             // 错误回调
  isReadOnly: boolean;               // 是否只读
  token?: string;                    // 访问令牌
  simple?: boolean;                  // 简单模式
  refreshToken?: (token: string, timeout?: number) => void;  // 刷新令牌函数
  [key: string]: any;               // 其他自定义参数
}
```

### Basic Usage / 基本用法

```javascript
import { initWPS, searchAndLocateText, insertTextAtCursor } from 'wps-sdk-wrapper';

// Initialize WPS / 初始化 WPS
const wpsInstance = await initWPS({
  fileId: "your-file-id",
  appId: "your-app-id",
  containerSelector: ".wps-container",
  onReady: (wps, app) => {
    console.log('WPS initialized / WPS 初始化成功', wps, app);
  },
  isReadOnly: false
});
```

## 📄 License / 许可证

MIT License - see [LICENSE](LICENSE) file for details.

MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🚀 Framework Examples / 框架示例

### Vanilla JavaScript / 原生 JavaScript

```javascript
import { initWPS, searchAndLocateText, insertTextAtCursor } from 'wps-sdk-wrapper';

// Initialize WPS
const wpsInstance = await initWPS({
  fileId: "your-file-id",
  appId: "your-app-id",
  containerSelector: ".wps-container",
  onReady: (wps, app) => {
    console.log('WPS initialized successfully', wps, app);
    window.wpsApp = app; // Store for later use
  },
  onError: (error) => {
    console.error('WPS initialization failed', error);
  },
  isReadOnly: false
});

// Use utilities
async function searchText() {
  const result = await searchAndLocateText(window.wpsApp, 'search text', true);
  if (result) {
    console.log('Text found at position:', result.pos);
  }
}

async function insertText() {
  await insertTextAtCursor(window.wpsApp, 'Hello from vanilla JS!');
}
```

### React Integration / React 集成

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { initWPS, searchAndLocateText, insertTextAtCursor, saveDocument } from 'wps-sdk-wrapper';

function WPSComponent() {
  const [app, setApp] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const initializeWPS = async () => {
      try {
        const result = await initWPS({
          fileId: "your-file-id",
          appId: "your-app-id",
          containerSelector: ".wps-container",
          onReady: (wps, app) => {
            setApp(app);
            console.log('WPS ready in React');
          },
          onError: (error) => {
            console.error('WPS error:', error);
          },
          isReadOnly: false
        });
      } catch (error) {
        console.error('Failed to initialize WPS:', error);
      }
    };

    initializeWPS();
  }, []);

  const handleSearch = async () => {
    if (!app) return;
    const result = await searchAndLocateText(app, 'React', true);
    console.log('Search result:', result);
  };

  const handleInsert = async () => {
    if (!app) return;
    await insertTextAtCursor(app, 'Text from React component!');
  };

  const handleSave = async () => {
    if (!app) return;
    await saveDocument(app);
  };

  return (
    <div>
      <div className="controls">
        <button onClick={handleSearch}>Search Text</button>
        <button onClick={handleInsert}>Insert Text</button>
        <button onClick={handleSave}>Save Document</button>
      </div>
      <div 
        className="wps-container" 
        ref={containerRef}
        style={{ width: '100%', height: '600px' }}
      />
    </div>
  );
}

export default WPSComponent;
```

### Vue.js Integration / Vue.js 集成

```vue
<template>
  <div>
    <div class="controls">
      <button @click="searchText">Search Text</button>
      <button @click="insertText">Insert Text</button>
      <button @click="saveDoc">Save Document</button>
    </div>
    <div 
      class="wps-container" 
      ref="wpsContainer"
      style="width: 100%; height: 600px;"
    />
  </div>
</template>

<script>
import { initWPS, searchAndLocateText, insertTextAtCursor, saveDocument } from 'wps-sdk-wrapper';

export default {
  name: 'WPSComponent',
  data() {
    return {
      wpsApp: null,
      wpsInstance: null
    };
  },
  async mounted() {
    try {
      await this.initializeWPS();
    } catch (error) {
      console.error('Failed to initialize WPS:', error);
    }
  },
  methods: {
    async initializeWPS() {
      const result = await initWPS({
        fileId: "your-file-id",
        appId: "your-app-id",
        containerSelector: ".wps-container",
        onReady: (wps, app) => {
          this.wpsInstance = wps;
          this.wpsApp = app;
          console.log('WPS ready in Vue');
        },
        onError: (error) => {
          console.error('WPS error:', error);
        },
        isReadOnly: false
      });
    },
    async searchText() {
      if (!this.wpsApp) return;
      const result = await searchAndLocateText(this.wpsApp, 'Vue', true);
      console.log('Search result:', result);
    },
    async insertText() {
      if (!this.wpsApp) return;
      await insertTextAtCursor(this.wpsApp, 'Text from Vue component!');
    },
    async saveDoc() {
      if (!this.wpsInstance) return;
      await saveDocument(this.wpsInstance);
    }
  },
  beforeUnmount() {
    // Cleanup if needed
    if (this.wpsInstance) {
      // Add any cleanup logic here
    }
  }
};
</script>
```

### Vue 3 Composition API / Vue 3 组合式 API

```vue
<template>
  <div>
    <div class="controls">
      <button @click="searchText">Search Text</button>
      <button @click="insertText">Insert Text</button>
      <button @click="saveDoc">Save Document</button>
    </div>
    <div 
      class="wps-container" 
      ref="wpsContainer"
      style="width: 100%; height: 600px;"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { initWPS, searchAndLocateText, insertTextAtCursor, saveDocument } from 'wps-sdk-wrapper';

const wpsContainer = ref(null);
const wpsApp = ref(null);
const wpsInstance = ref(null);

onMounted(async () => {
  try {
    await initializeWPS();
  } catch (error) {
    console.error('Failed to initialize WPS:', error);
  }
});

const initializeWPS = async () => {
  const result = await initWPS({
    fileId: "your-file-id",
    appId: "your-app-id",
    containerSelector: ".wps-container",
    onReady: (wps, app) => {
      wpsInstance.value = wps;
      wpsApp.value = app;
      console.log('WPS ready in Vue 3');
    },
    onError: (error) => {
      console.error('WPS error:', error);
    },
    isReadOnly: false
  });
};

const searchText = async () => {
  if (!wpsApp.value) return;
  const result = await searchAndLocateText(wpsApp.value, 'Vue 3', true);
  console.log('Search result:', result);
};

const insertText = async () => {
  if (!wpsApp.value) return;
  await insertTextAtCursor(wpsApp.value, 'Text from Vue 3 Composition API!');
};

const saveDoc = async () => {
  if (!wpsInstance.value) return;
  await saveDocument(wpsInstance.value);
};

onUnmounted(() => {
  // Cleanup if needed
});
</script>
```

### Angular Integration / Angular 集成

```typescript
// wps.service.ts
import { Injectable } from '@angular/core';
import { initWPS, searchAndLocateText, insertTextAtCursor, saveDocument } from 'wps-sdk-wrapper';

@Injectable({
  providedIn: 'root'
})
export class WPSService {
  private wpsApp: any = null;
  private wpsInstance: any = null;

  async initializeWPS(config: any): Promise<void> {
    try {
      await initWPS({
        ...config,
        onReady: (wps: any, app: any) => {
          this.wpsInstance = wps;
          this.wpsApp = app;
          console.log('WPS ready in Angular');
        },
        onError: (error: any) => {
          console.error('WPS error:', error);
        }
      });
    } catch (error) {
      console.error('Failed to initialize WPS:', error);
      throw error;
    }
  }

  async searchText(text: string): Promise<any> {
    if (!this.wpsApp) return null;
    return await searchAndLocateText(this.wpsApp, text, true);
  }

  async insertText(text: string): Promise<void> {
    if (!this.wpsApp) return;
    await insertTextAtCursor(this.wpsApp, text);
  }

  async saveDocument(): Promise<void> {
    if (!this.wpsInstance) return;
    await saveDocument(this.wpsInstance);
  }

  getApp(): any {
    return this.wpsApp;
  }
}
```

```typescript
// wps.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { WPSService } from './wps.service';

@Component({
  selector: 'app-wps',
  template: `
    <div>
      <div class="controls">
        <button (click)="searchText()">Search Text</button>
        <button (click)="insertText()">Insert Text</button>
        <button (click)="saveDoc()">Save Document</button>
      </div>
      <div 
        class="wps-container" 
        style="width: 100%; height: 600px;">
      </div>
    </div>
  `
})
export class WPSComponent implements OnInit, OnDestroy {

  constructor(private wpsService: WPSService) {}

  async ngOnInit() {
    try {
      await this.wpsService.initializeWPS({
        fileId: "your-file-id",
        appId: "your-app-id",
        containerSelector: ".wps-container",
        isReadOnly: false
      });
    } catch (error) {
      console.error('Failed to initialize WPS:', error);
    }
  }

  async searchText() {
    const result = await this.wpsService.searchText('Angular');
    console.log('Search result:', result);
  }

  async insertText() {
    await this.wpsService.insertText('Text from Angular component!');
  }

  async saveDoc() {
    await this.wpsService.saveDocument();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }
}
```

## 🔧 Development / 开发

```bash
# Install dependencies / 安装依赖
npm install

# Start development server (React example) / 启动开发服务器（React示例）
npm run dev

# Build library / 构建库
npm run build

# Build example / 构建示例
npm run build:example
```

## 💡 Design Advantages / 设计优势

1. **Framework Agnostic** - Core code has no specific framework dependencies / **框架无关** - 核心代码不依赖任何特定框架
2. **Flexible Integration** - Easy integration into any modern frontend framework / **灵活集成** - 可轻松集成到任何现代前端框架中
3. **Type Safe** - Full TypeScript support / **类型安全** - 完整的 TypeScript 支持
4. **Tree Shaking** - Supports on-demand imports / **按需导入** - 支持按需导入，减少打包体积
5. **Easy Extension** - New features can be easily added / **易于扩展** - 新增功能只需添加到工具集并导出

## 📁 Project Structure / 项目结构

```
wps-sdk-wrapper/
├── index.ts          # Main entry file (framework-agnostic) / 主入口文件（框架无关）
├── src/              # React example project / React 示例项目源码
│   ├── App.tsx       # React example app / React 示例应用
│   ├── main.tsx      # React example entry / React 示例入口
│   └── mockWPSSDK.ts # Mock SDK
├── sdk/              # WPS SDK files / WPS SDK 文件
├── dist/             # Build output / 构建输出目录
└── README.md         # Documentation / 说明文档
```

## 🤝 Contributing / 贡献

Contributions are welcome! Please feel free to submit a Pull Request.

欢迎贡献！请随时提交 Pull Request。

## 🌐 Related Links / 相关链接

- [WPS Open Platform / WPS 开放平台](https://wwo.wps.cn/)
- [React Official Documentation / React 官方文档](https://reactjs.org/)
- [Vue.js Official Documentation / Vue.js 官方文档](https://vuejs.org/)
- [Angular Official Documentation / Angular 官方文档](https://angular.io/)
- [TypeScript Official Documentation / TypeScript 官方文档](https://www.typescriptlang.org/)