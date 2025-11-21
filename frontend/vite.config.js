import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: "Debty",
        short_name: "Debtly",
        description: "Bookkeeping app for small business owners",
        start_url: "/",
        display: "fullscreen",
        background_color: "#000",
        theme_color: "#000000",
        orientation: "portrait",
        scope: "/",
        lang: "en",
        icons: [
  {
    "src": "/icons/android/android-launchericon-512-512.png",
    "sizes": "512x512",
    "type": "image/png"
  },
  {
    "src": "/icons/android/android-launchericon-192-192.png",
    "sizes": "192x192",
    "type": "image/png"
  },
  {
    "src": "/icons/android/android-launchericon-144-144.png",
    "sizes": "144x144",
    "type": "image/png"
  },
  {
    "src": "/icons/android/android-launchericon-96-96.png",
    "sizes": "96x96",
    "type": "image/png"
  },
  {
    "src": "/icons/android/android-launchericon-72-72.png",
    "sizes": "72x72",
    "type": "image/png"
  },
  {
    "src": "/icons/android/android-launchericon-48-48.png",
    "sizes": "48x48",
    "type": "image/png"
  }
]

      },

      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              ["document", "script", "style", "image", "font"].includes(
                request.destination
              ),
            handler: "CacheFirst",
            options: {
              cacheName: "assets-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 3
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": "/src"
    }
  }
});
