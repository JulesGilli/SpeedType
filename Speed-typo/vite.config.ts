import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/SpeedType/', // <<< ajoute cette ligne avec ton nom de repo exact
  plugins: [react()],
})
