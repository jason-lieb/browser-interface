import {defineConfig} from 'vite'
import {chromeExtension} from 'vite-plugin-chrome-extension'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    chromeExtension(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      input: 'manifest.json',
    },
  },
})
