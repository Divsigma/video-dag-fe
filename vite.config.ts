import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/dag': {
        // target: "http://192.168.56.102:5000",
        // target: "http://114.212.87.36:5000",
        target: "http://114.212.81.11:5000",
        // target: "http://172.27.152.177:5000",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/dag/, '')
      },
      '/serv': {
        // target: "http://192.168.56.102:5500",
        // target: "http://114.212.87.36:5500",
        target: "http://114.212.81.11:5500",
        // target: "http://172.27.152.177:5500",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/serv/, '')
      },
      '/video': {
        // target: "http://192.168.56.102:5100",
        // target: "http://114.212.87.36:5100",
        target: "http://114.212.81.11:5100",
        // target: "http://172.27.152.177:5100",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/video/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
