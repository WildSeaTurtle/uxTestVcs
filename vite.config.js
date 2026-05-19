import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/VCSprototypes/',
  plugins: [react({ include: /\.[jt]sx?$/ })],
  server: {
    fs: {
      allow: [
        dirname,
        path.resolve(dirname, 'vendor/int-ui-kit'),
        path.resolve(dirname, 'node_modules/@jetbrains/int-ui-kit'),
      ],
    },
  },
  resolve: {
    alias: [
      {
        find: '@jetbrains/int-ui-kit/styles.css',
        replacement: path.resolve(dirname, 'vendor/int-ui-kit/dist/esm/styles.css'),
      },
      {
        find: '@jetbrains/int-ui-kit',
        replacement: path.resolve(dirname, 'vendor/int-ui-kit/dist/esm/index.js'),
      },
      {
        find: '@jetbrains/int-ui-kit-icons',
        replacement: path.resolve(dirname, 'vendor/int-ui-kit/src/icons'),
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
