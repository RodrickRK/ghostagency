import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import netlify from "@netlify/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    netlify()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "client/index.html")
      }
    }
  },
  server: {
    fs: {
      strict: false,
      allow: ['..']
    },
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8888/.netlify/functions/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    watch: {
      usePolling: true
    }
  },
  optimizeDeps: {
    exclude: ['@netlify/functions']
  }
});
