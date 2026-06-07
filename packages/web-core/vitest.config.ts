import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@kawuxing/shared': resolve(__dirname, '../shared/src'),
      '@kawuxing/protocol': resolve(__dirname, '../protocol/src'),
    },
  },
})
