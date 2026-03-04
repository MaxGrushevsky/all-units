import { defineConfig } from 'tsup'

export default defineConfig([
  // ESM + CJS: for bundlers, Node.js, Deno, Bun
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    target: 'es2015',
    dts: true,
    clean: true,
    minify: true,
    treeshake: true,
  },
  // IIFE: for browser via <script> tag and CDN (unpkg, jsDelivr)
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'AllUnits',
    target: 'es2015',
    outExtension: () => ({ js: '.global.js' }),
    sourcemap: false,
    minify: true,
    treeshake: true,
  },
])
