import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/MathLegendsNew/',
  plugins: [react()],
  server: {
    port: 3000
  }
}) 