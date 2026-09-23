import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: mode === 'development',
  },
  resolve: {
    tsconfigPaths: true,
  },
  css: {
    postcss: './postcss.config.cjs',
    devSourcemap: mode === 'development',
  },
}))
