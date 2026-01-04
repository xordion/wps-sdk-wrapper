import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false, // 生产环境不包含sourcemap
  clean: true,
  minify: 'terser', // 使用terser进行更好的压缩
  treeshake: true, // 启用tree shaking
  splitting: false, // 对于库来说关闭代码分割
  bundle: true,
  outDir: 'dist',
  target: 'es2020', // 提升目标版本以启用更多优化
  
  // 排除外部依赖，减小打包体积
  external: [
    'react',
    'react-dom',
    'i18next',
    'react-i18next',
  ],
  
  // 生产优化选项
  esbuildOptions(options) {
    options.drop = ['console', 'debugger'] // 移除console和debugger
    options.treeShaking = true
    options.minifyWhitespace = true
    options.minifyIdentifiers = true
    options.minifySyntax = true
    // 移除未使用的导入
    options.dropLabels = ['DEV']
  },

  // 定义全局变量替换，移除开发代码
  define: {
    __DEV__: 'false',
    'process.env.NODE_ENV': '"production"'
  },

  // 高级优化选项
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.warn', 'console.error'],
      passes: 3 // 多次压缩以获得更好效果
    },
    mangle: {
      safari10: true // 解决Safari 10的问题
    },
    format: {
      comments: false // 移除注释
    }
  }
})
