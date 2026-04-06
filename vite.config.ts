import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(), 
    viteSingleFile({
      removeViteModuleLoader: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico', 
        'tesseract/worker.min.js', 
        'tesseract/tesseract-core-simd.wasm.js', 
        'tesseract/eng.traineddata.gz'
      ],
      manifest: {
        name: 'DocuShrink AI – Smart Document Processing',
        short_name: 'DocuShrink',
        description: 'Professional AI-powered document processing, OCR, and PDF tools.',
        theme_color: '#020205',
        background_color: '#020205',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // Allow up to 20MB for AI workers
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
