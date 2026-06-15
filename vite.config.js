import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        subjects: resolve(__dirname, 'subjects.html'),
        profile: resolve(__dirname, 'profile.html'),
        archives: resolve(__dirname, 'archives.html'),
        tides: resolve(__dirname, 'tides.html'),
      }
    }
  }
})
