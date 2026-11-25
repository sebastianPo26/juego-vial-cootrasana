import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// base './' permite publicar la carpeta dist/ en cualquier ruta
// (por ejemplo https://talentohumano.cootrasana.com.co/juego_vial/).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Reenvío en el computador (npm run dev): solo se activa si .env trae SERVIDOR_JUEGO_ANTERIOR.
  // Hace que /juego_vial/... se envíe al servidor real, para que la galleta de sesión funcione.
  const destino = env.SERVIDOR_JUEGO_ANTERIOR
  return {
    base: './',
    plugins: [react()],
    server: destino
      ? { proxy: { '/juego_vial': { target: destino, changeOrigin: true, secure: true } } }
      : {},
  }
})
