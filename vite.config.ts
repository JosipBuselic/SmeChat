import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
      '/api/zagreb-proxy': {
        target: 'https://data.zagreb.hr',
        changeOrigin: true,
        rewrite: (pathStr) => {
          try {
            const q = pathStr.split('?')[1]
            const p = new URLSearchParams(q).get('p')
            return p ? decodeURIComponent(p) : '/'
          } catch {
            return '/'
          }
        },
      },
      '/api/arcgis-proxy': {
        target: 'https://opendata.arcgis.com',
        changeOrigin: true,
        rewrite: (pathStr) => {
          try {
            const q = pathStr.split('?')[1]
            const p = new URLSearchParams(q).get('p')
            return p ? decodeURIComponent(p) : '/'
          } catch {
            return '/'
          }
        },
      },
    },
  },
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
