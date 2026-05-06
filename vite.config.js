import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react({ include: /\.[jt]sx?$/ })],
  resolve: {
    alias: [
      {
        find: '@jetbrains/int-ui-kit/styles.css',
        replacement: path.resolve(__dirname, '../int-ui-kit-for-web/src/lib/styles.js'),
      },
      {
        find: '@jetbrains/int-ui-kit',
        replacement: path.resolve(__dirname, '../int-ui-kit-for-web/src/lib/index.js'),
      },
      {
        find: 'react',
        replacement: path.resolve(__dirname, 'node_modules/react'),
      },
      {
        find: 'react-dom',
        replacement: path.resolve(__dirname, 'node_modules/react-dom'),
      },
    ],
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})