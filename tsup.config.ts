import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: false, // 生产环境不包含sourcemap
  clean: true,
  minify: true, // 启用代码压缩
  treeshake: true, // 启用tree shaking
  splitting: false,
  bundle: true,
  outDir: 'dist',
  target: 'es2019',
  // 生产优化选项
  esbuildOptions(options) {
    options.drop = ['console', 'debugger'] // 移除console和debugger
  }
})
