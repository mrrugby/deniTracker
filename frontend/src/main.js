import { createApp } from "vue"
import App from "./App.vue"
import "./assets/main.css"
import { router } from "./router"
import { pinia } from "./stores"

createApp(App).use(pinia).use(router).mount("#app")