import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' permite publicar la carpeta dist/ en cualquier ruta
// (por ejemplo https://talentohumano.cootrasana.com.co/juego_vial/).
export default defineConfig({
  base: './',
  plugins: [react()],
})
