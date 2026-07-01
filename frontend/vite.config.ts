import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/api/ndbc/latest_obs.txt': {
        target: 'https://www.ndbc.noaa.gov',
        changeOrigin: true,
        rewrite: () => '/data/latest_obs/latest_obs.txt',
      },
    },
  },
})
