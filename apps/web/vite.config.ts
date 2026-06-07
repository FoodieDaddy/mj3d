import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@kawuxing/protocol': resolve(__dirname, '../../packages/protocol/src'),
      '@kawuxing/web-core': resolve(__dirname, '../../packages/web-core/src'),
      '@kawuxing/shared': resolve(__dirname, '../../packages/shared/src'),
    },
  },
})
