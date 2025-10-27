import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ตั้งค่า Vitest ที่นี่
    environment: 'node',
    globals: true
  }
})