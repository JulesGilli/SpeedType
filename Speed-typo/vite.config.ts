import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Speed-Typo/', // <<< ajoute cette ligne avec ton nom de repo exact
  plugins: [react()],
})
