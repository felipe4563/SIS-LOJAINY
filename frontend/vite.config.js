import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    host: true, // escucha en todas las interfaces de red
    port: 5173, // puerto que uses, por defecto 5173
  },
})
