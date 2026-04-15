import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // ADD THIS LINE: Replace 'ungrie-landing-page' with your exact GitHub repo name
  base: '/Ungrie/', 
  plugins: [
    react(),
    tailwindcss(),
  ],
})
