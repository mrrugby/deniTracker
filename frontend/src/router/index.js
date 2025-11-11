import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import CustomerProfile from '@/views/CustomerProfile.vue';
import Customers from '@/views/Customers.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/customer/:id', name: 'CustomerProfile', component: CustomerProfile },
  { path: "/customers", name: 'customers', component: Customers}
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});


