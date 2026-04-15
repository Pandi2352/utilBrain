import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 9000,       // Always use port 9000
    strictPort: true, // Fail if 9000 is already in use (no silent fallback)
    open: true,       // Auto-open browser on npm run dev
  },
})
