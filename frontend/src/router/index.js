import { createRouter, createWebHistory } from "vue-router"
import Dashboard from "@/views/Dashboard.vue"
import CustomerProfile from "@/views/CustomerProfile.vue"

// Temporary placeholder pages
import Customers from "@/views/Customers.vue";
import Transactions from "@/views/Transactions.vue";
import Reports from "@/views/Reports.vue";

const routes = [
    { path: "/", name: "Dashboard", component: Dashboard },
    { path: "/customer/:id", name: "CustomerProfile", component: CustomerProfile },
    { path: "/customers", name: "Customers", component: Customers },
    { path: "/transactions", name: "Transactions", component: Transactions },
    { path: "/reports", name: "Reports", component: Reports },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
