# WPS SDK Wrapper

[English](#english) | [中文](#中文)

---

## English

A **framework-agnostic** utility toolkit for WPS WebOffice SDK integration. Works seamlessly with React, Vue, Angular, or vanilla JavaScript.

### 🌟 Features

- 🚀 **Framework Agnostic** - Works with any JavaScript framework or vanilla JS
- 🛠️ **Rich Utilities** - Comprehensive toolkit for document operations
- 📝 **TypeScript Support** - Full TypeScript definitions included
- 🎯 **Modern Development** - Built with modern JavaScript patterns and best practices
- 📦 **Tree Shaking** - Supports tree shaking for optimal bundle size
- 🔧 **Zero Dependencies** - Core library has no framework dependencies

### 📦 Installation

```bash
npm install wps-sdk-wrapper
```

### 🚀 Quick Start

#### Vanilla JavaScript

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

#### React Integration

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

#### Vue.js Integration

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

#### Vue 3 Composition API

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

#### Angular Integration

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

### 🛠️ Available Utilities

#### Initialization
- `initWPS` - Initialize WPS instance
- `getWPSApplication` - Get WPS application instance  
- `setDocumentReadOnly` - Set document read-only status

#### Text Operations
- `searchAndLocateText` - Search and locate text in document
- `insertTextAtCursor` - Insert text at cursor position
- `clearHitHighlight` - Clear text highlighting
- `replaceOriginalContent` - Replace original content

#### Document Management
- `saveDocument` - Save document
- `getDocLength` - Get document length
- `formatDocumentFont` - Format document font

#### Revision Management
- `getLatestRevisionDate` - Get latest revision date
- `collectRevisionInfos` - Collect revision information
- `handleMatchingRevisions` - Accept/reject matching revisions
- `handleRevisionContent` - Handle revision content

### 📚 API Reference

#### initWPS Options

```typescript
interface InitWPSOptions {
  fileId: string;
  appId: string;
  containerSelector: string;
  onReady?: (wps: any, app: any) => void;
  onError?: (error: any) => void;
  isReadOnly: boolean;
  token?: string;
  simple?: boolean;
  refreshToken?: (token: string, timeout?: number) => void;
  [key: string]: any;
}
```

### 🔧 Development

```bash
# Install dependencies
npm install

# Start development server (React example)
npm run dev

# Build library
npm run build

# Build example
npm run build:example
```

### 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 中文

一个**框架无关**的 WPS WebOffice SDK 工具库。可与 React、Vue、Angular 或原生 JavaScript 无缝配合使用。

### 🌟 特性

- 🚀 **框架无关** - 可与任何 JavaScript 框架或原生 JS 配合使用
- 🛠️ **丰富工具** - 提供全面的文档操作工具集
- 📝 **TypeScript 支持** - 包含完整的 TypeScript 类型定义
- 🎯 **现代开发** - 使用现代 JavaScript 模式和最佳实践构建
- 📦 **Tree Shaking** - 支持 tree shaking，优化打包体积
- 🔧 **零依赖** - 核心库无框架依赖

### 📦 安装

```bash
npm install wps-sdk-wrapper
```

### 🚀 快速开始

#### 原生 JavaScript

```javascript
import { initWPS, searchAndLocateText, insertTextAtCursor } from 'wps-sdk-wrapper';

// 初始化 WPS
const wpsInstance = await initWPS({
  fileId: "your-file-id",
  appId: "your-app-id",
  containerSelector: ".wps-container",
  onReady: (wps, app) => {
    console.log('WPS 初始化成功', wps, app);
    window.wpsApp = app; // 保存以备后用
  },
  onError: (error) => {
    console.error('WPS 初始化失败', error);
  },
  isReadOnly: false
});

// 使用工具方法
async function searchText() {
  const result = await searchAndLocateText(window.wpsApp, '搜索文本', true);
  if (result) {
    console.log('文本找到，位置:', result.pos);
  }
}

async function insertText() {
  await insertTextAtCursor(window.wpsApp, '来自原生JS的问候!');
}
```

#### React 集成

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
            console.log('React 中 WPS 就绪');
          },
          onError: (error) => {
            console.error('WPS 错误:', error);
          },
          isReadOnly: false
        });
      } catch (error) {
        console.error('WPS 初始化失败:', error);
      }
    };

    initializeWPS();
  }, []);

  const handleSearch = async () => {
    if (!app) return;
    const result = await searchAndLocateText(app, 'React', true);
    console.log('搜索结果:', result);
  };

  const handleInsert = async () => {
    if (!app) return;
    await insertTextAtCursor(app, '来自 React 组件的文本!');
  };

  const handleSave = async () => {
    if (!app) return;
    await saveDocument(app);
  };

  return (
    <div>
      <div className="controls">
        <button onClick={handleSearch}>搜索文本</button>
        <button onClick={handleInsert}>插入文本</button>
        <button onClick={handleSave}>保存文档</button>
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

#### Vue.js 集成

```vue
<template>
  <div>
    <div class="controls">
      <button @click="searchText">搜索文本</button>
      <button @click="insertText">插入文本</button>
      <button @click="saveDoc">保存文档</button>
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
      console.error('WPS 初始化失败:', error);
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
          console.log('Vue 中 WPS 就绪');
        },
        onError: (error) => {
          console.error('WPS 错误:', error);
        },
        isReadOnly: false
      });
    },
    async searchText() {
      if (!this.wpsApp) return;
      const result = await searchAndLocateText(this.wpsApp, 'Vue', true);
      console.log('搜索结果:', result);
    },
    async insertText() {
      if (!this.wpsApp) return;
      await insertTextAtCursor(this.wpsApp, '来自 Vue 组件的文本!');
    },
    async saveDoc() {
      if (!this.wpsInstance) return;
      await saveDocument(this.wpsInstance);
    }
  },
  beforeUnmount() {
    // 如需要，添加清理逻辑
    if (this.wpsInstance) {
      // 在这里添加清理逻辑
    }
  }
};
</script>
```

#### Vue 3 组合式 API

```vue
<template>
  <div>
    <div class="controls">
      <button @click="searchText">搜索文本</button>
      <button @click="insertText">插入文本</button>
      <button @click="saveDoc">保存文档</button>
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
    console.error('WPS 初始化失败:', error);
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
      console.log('Vue 3 中 WPS 就绪');
    },
    onError: (error) => {
      console.error('WPS 错误:', error);
    },
    isReadOnly: false
  });
};

const searchText = async () => {
  if (!wpsApp.value) return;
  const result = await searchAndLocateText(wpsApp.value, 'Vue 3', true);
  console.log('搜索结果:', result);
};

const insertText = async () => {
  if (!wpsApp.value) return;
  await insertTextAtCursor(wpsApp.value, '来自 Vue 3 组合式 API 的文本!');
};

const saveDoc = async () => {
  if (!wpsInstance.value) return;
  await saveDocument(wpsInstance.value);
};

onUnmounted(() => {
  // 如需要，添加清理逻辑
});
</script>
```

#### Angular 集成

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
          console.log('Angular 中 WPS 就绪');
        },
        onError: (error: any) => {
          console.error('WPS 错误:', error);
        }
      });
    } catch (error) {
      console.error('WPS 初始化失败:', error);
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

### 💡 设计优势

1. **框架无关** - 核心代码不依赖任何特定框架
2. **灵活集成** - 可轻松集成到任何现代前端框架中
3. **类型安全** - 完整的 TypeScript 支持
4. **按需导入** - 支持按需导入，减少打包体积
5. **易于扩展** - 新增功能只需添加到工具集并导出

### 📁 项目结构

```
wps-sdk-wrapper/
├── index.ts          # 主入口文件（框架无关）
├── src/              # React 示例项目源码
│   ├── App.tsx       # React 示例应用
│   ├── main.tsx      # React 示例入口
│   └── mockWPSSDK.ts # Mock SDK
├── sdk/              # WPS SDK 文件
├── dist/             # 构建输出目录
└── README.md         # 说明文档
```

### 📄 许可证

MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

### 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

### 🌐 相关链接

- [WPS 开放平台](https://wwo.wps.cn/)
- [React 官方文档](https://reactjs.org/)
- [Vue.js 官方文档](https://vuejs.org/)
- [Angular 官方文档](https://angular.io/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)