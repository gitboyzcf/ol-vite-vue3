import vue from '@vitejs/plugin-vue'

export default {
  base: '/ol-vite-vue3/',
  plugins: [
    vue(),
  ],
  build: {
    sourcemap: true,
  }
}
