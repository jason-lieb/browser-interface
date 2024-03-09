import {defineConfig} from 'vite'
import {chromeExtension} from 'vite-plugin-chrome-extension'

export default defineConfig({
  plugins: [chromeExtension()],
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      input: 'manifest.json',
    },
  },
})
