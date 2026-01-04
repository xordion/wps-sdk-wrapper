# NPM 发布检查清单 / NPM Publishing Checklist

## 🛠️ 本地开发

### .npmrc 配置

```bash
# 发布
registry=https://nexus.qtech.cn/repository/npm-hosted/

# 本地安装运行
registry=https://nexus.qtech.cn/repository/npm-grouped/
```

### 启动开发服务器

```bash
# 安装依赖
npm install

# 启动示例项目进行开发调试
npm run dev
```

示例项目会在 http://localhost:5173 启动，提供完整的组件调试界面。

### 构建组件库

```bash
# 构建生产版本
npm run build

# 清理构建文件
npm run clean
```

### 预览示例项目

```bash
npm run preview
```

## 📦 发布前检查 / Pre-publish Checklist

### 1. 版本管理 / Version Management
- [ ] 确认版本号符合语义化版本规范 (semver)
- [ ] 更新 package.json 中的版本号
- [ ] 创建对应的 git tag

```bash
# 更新版本号
npm version patch   # 修复版本 (0.1.3 -> 0.1.4)
npm version minor   # 功能版本 (0.1.3 -> 0.2.0)  
npm version major   # 主版本 (0.1.3 -> 1.0.0)
```

### 2. 代码质量 / Code Quality
- [ ] 运行所有测试用例
- [ ] 检查 TypeScript 类型定义
- [ ] 确保没有 console.log 等调试代码
- [ ] 代码格式化和 lint 检查

```bash
# 构建检查
npm run build
npm run dev  # 测试示例项目
```

### 3. 文档完整性 / Documentation
- [x] README.md 包含中英文文档
- [x] package.json description 准确描述项目
- [x] keywords 标签完整
- [x] LICENSE 文件存在
- [ ] CHANGELOG.md 记录版本变更

### 4. 包配置 / Package Configuration
- [x] package.json 主要字段正确配置:
  - [x] name, version, description
  - [x] main, module, types 入口文件
  - [x] exports 字段配置
  - [x] files 字段包含必要文件
  - [x] repository, homepage, bugs 链接
  - [x] keywords 关键词
- [x] .npmignore 正确配置（或使用 files 字段）

### 5. 构建产物 / Build Artifacts
- [ ] dist/ 目录包含以下文件:
  - [ ] index.js (ESM 格式)
  - [ ] index.cjs (CommonJS 格式)
  - [ ] index.d.ts (TypeScript 声明)
  - [ ] index.d.mts (TypeScript ESM 声明)

```bash
npm run clean
npm run build
ls -la dist/
```

### 6. 发布配置 / Publishing Configuration
- [ ] 确认发布到npm官方站点
- [ ] 检查 npm 登录状态  
- [ ] 验证package.json中的publishConfig配置

```bash
# 检查当前 registry
npm config get registry

# 切换到 npm 官方站点（如果当前不是）
npm config set registry https://registry.npmjs.org/

# 检查登录状态
npm whoami

# 登录npm官方站点（首次发布需要先注册账号：https://www.npmjs.com/）
npm login
```

**注意**：package.json已配置publishConfig确保发布到官方站点：
```json
"publishConfig": {
  "registry": "https://registry.npmjs.org/"
}
```

### 7. 发布流程 / Publishing Process

```bash
# 1. 最终检查
npm run prepublishOnly

# 2. 本地测试包
npm pack
# 这会生成 .tgz 文件，可以在其他项目中测试安装

# 3. 发布到 npm
npm publish

# 4. 验证发布
npm view wps-sdk-wrapper
```

### 8. 发布后检查 / Post-publish Verification
- [ ] 在 npmjs.com 上确认包已发布
- [ ] 在新项目中测试安装和使用
- [ ] 检查 README 在 npm 页面上显示正确
- [ ] 更新项目文档和示例

```bash
# 在新目录测试安装
mkdir test-install && cd test-install
npm init -y
npm install wps-sdk-wrapper
```

## 常见问题 / Common Issues

### 发布失败
- 检查包名是否已被占用
- 确认网络连接和 npm 认证
- 检查 package.json 配置

### 类型定义问题
- 确保 types 字段指向正确的 .d.ts 文件
- 检查 TypeScript 版本兼容性

### 依赖问题
- 确认 peerDependencies 版本范围合理
- 检查 devDependencies 不会影响最终用户

## 回滚 / Rollback

如果需要撤销发布:

```bash
# 撤销发布 (仅限发布后 24 小时内)
npm unpublish wps-sdk-wrapper@version

# 或者标记为废弃
npm deprecate wps-sdk-wrapper@version "This version has been deprecated"
```

## 🔧 维护指南

### 添加新的工具方法

1. 在相应的模块文件中实现新方法（如 `src/components/WpsViewer/modules/xxx.ts`）
2. 在模块文件中导出新方法
3. 在 `src/components/WpsViewer/index.ts` 中确保模块被重新导出
4. 在项目根目录的 `index.ts` 中添加导出
5. 在示例项目中添加测试用例（`src/App.tsx`）
6. 更新 README 文档

### 模块依赖原则

- `common.ts` - 基础模块，不依赖其他模块
- 其他模块只依赖 `common.ts` 和同级模块
- 避免循环依赖，保持清晰的依赖关系

### 代码风格

- 使用 TypeScript 严格模式
- 函数名采用驼峰命名
- 导出使用 named export
- 添加完整的类型注解和 JSDoc 注释

### 项目结构说明

```
wps-sdk-wrapper/
├── index.ts                    # 统一导出文件（npm 包入口）
├── src/
│   ├── components/             # 组件目录
│   │   └── WpsViewer/          # WPS 查看器模块
│   │       ├── index.ts        # 模块聚合导出
│   │       ├── modules/        # 功能模块目录
│   │       │   ├── common.ts   # 公共类型和工具
│   │       │   ├── core.ts     # WPS 核心功能
│   │       │   ├── highlight.ts # 高亮和颜色操作
│   │       │   ├── search.ts   # 搜索和定位
│   │       │   ├── text.ts     # 文本操作
│   │       │   ├── revisions.ts # 修订管理
│   │       │   ├── formatting.ts # 格式化操作
│   │       │   └── utils.ts    # 工具函数
│   │       └── sdk/            # WPS SDK 文件（v2.0.6）
│   ├── utils/                  # 通用工具
│   └── interface.ts            # 类型定义
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```
