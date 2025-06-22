import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',               // 👈 required for correct routing
  build: {
    outDir: 'dist'         // 👈 required so Amplify knows where to deploy from
  }
})
