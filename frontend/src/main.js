import { createApp } from "vue"
import App from "./App.vue"
import "./assets/main.css"
import { router } from "./router"
import { createPinia } from "pinia"          // ← ADD THIS
import { syncOfflineTransactions } from "./services/offline"
import { registerSW } from "virtual:pwa-register"

const pinia = createPinia()                  // ← CREATE INSTANCE

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New version available. Reload now?")) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline")
  },
})

window.addEventListener("online", () => {
  syncOfflineTransactions().then(() => {
    console.log("Synced offline transactions")
  })
})

// Mount app with Pinia + Router
createApp(App).use(pinia).use(router).mount("#app")