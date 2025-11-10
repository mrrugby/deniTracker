import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from "vite-plugin-pwa"
import path from "path";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
        registerType: "autoUpdate",
        manifest:{
            name: "DeniTracker",
            short_name: "DeniTracker",
            start_url: "/",
            display: "standalone",
            background_color: "ffffff",
            theme_color: "#2563eb",
            icons: [
                { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
                { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
            ],
        },
    }),

],
 resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
