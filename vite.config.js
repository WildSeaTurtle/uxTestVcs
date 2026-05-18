import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react({ include: /\.[jt]sx?$/ })],
  resolve: {
    alias: [
      {
        find: '@jetbrains/int-ui-kit/styles.css',
        replacement: path.resolve(dirname, '../int-ui-kit-for-web/src/lib/styles.js'),
      },
      {
        find: '@jetbrains/int-ui-kit',
        replacement: path.resolve(dirname, '../int-ui-kit-for-web/src/lib/index.js'),
      },
      {
        find: 'react',
        replacement: path.resolve(dirname, 'node_modules/react'),
      },
      {
        find: 'react-dom',
        replacement: path.resolve(dirname, 'node_modules/react-dom'),
      },
      {
        find: 'prop-types',
        replacement: path.resolve(dirname, 'node_modules/prop-types'),
      },
      {
        find: 'prism-react-editor/prism',
        replacement: path.resolve(dirname, 'node_modules/prism-react-editor/dist/prism/index.js'),
      },
      {
        find: 'prism-react-editor/layout.css',
        replacement: path.resolve(dirname, 'node_modules/prism-react-editor/dist/layout.css'),
      },
      {
        find: 'prism-react-editor',
        replacement: path.resolve(dirname, 'node_modules/prism-react-editor/dist/index.js'),
      },
    ],
    dedupe: ['react', 'react-dom', 'prop-types', 'prism-react-editor'],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
