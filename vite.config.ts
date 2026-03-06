import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react/jsx") || id.includes("react-router")) return "react-vendor"
            if (id.includes("firebase")) return "firebase"
            if (id.includes("framer-motion")) return "framer-motion"
            if (id.includes("@ffmpeg")) return "ffmpeg"
            if (id.includes("tsparticles")) return "tsparticles"
            if (id.includes("@radix-ui")) return "radix-ui"
            if (id.includes("i18next")) return "i18n"
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})
