import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import CustomerProfile from '@/views/CustomerProfile.vue';
import Customers from '@/views/Customers.vue';
import Transactions from '@/views/Transactions.vue';
import Stock from '@/views/Stock.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/customer/:id', name: 'CustomerProfile', component: CustomerProfile },
  { path: "/customers", name: 'customers', component: Customers},
  { path: '/transactions', name: 'Transactions', component: Transactions },
  { path: '/stock', name: 'Stock', component: Stock },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});


