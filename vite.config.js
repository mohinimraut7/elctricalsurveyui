import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Core vendor libraries वेगळ्या chunks मध्ये → browser cache जास्त वेळ टिकतो,
// आणि map / charts फक्त ती page उघडल्यावरच download होतात (lazy routes).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // फक्त core libs (प्रत्येक page ला लागणाऱ्या) वेगळ्या stable chunk मध्ये.
          // leaflet / recharts lazy imports मधूनच येतात → Vite आपोआप वेगळे chunks बनवतो.
          if (!id.includes('node_modules')) return
          if (/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//.test(id)) return 'react-vendor'
          if (/node_modules\/(@reduxjs|react-redux|redux|immer|reselect|redux-thunk)\//.test(id)) return 'redux-vendor'
        },
      },
    },
  },
})
