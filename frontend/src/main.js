import { createApp } from "vue"
import App from "./App.vue"
import "./assets/main.css"
import { router } from "./router"
import { syncOfflineTransactions } from "./services/offline"
import { registerSW } from "virtual:pwa-register"

const updateSW = registerSW({
    onNeedRefresh(){
        if (confirm("new version available. Reload Now?")){
            updateSW(true);
        }
    },
    onofflineReady(){
        console.log("app ready to work offline 🚀")
    }
})

window.addEventListener("online", () =>{
    syncOfflineTransactions().then(() =>{
        console.log("✅ Synced offline transactions")
    });
});


createApp(App).use(router).mount("#app")