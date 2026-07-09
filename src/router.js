import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from './views/DashboardView.vue';
import CustomersView from './views/CustomersView.vue';
import CustomerProfileView from './views/CustomerProfileView.vue';
import StockView from './views/StockView.vue';
import SettingsView from './views/SettingsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'Dashboard' }
    },
    {
      path: '/customers',
      name: 'customers',
      component: CustomersView,
      meta: { title: 'Customers' }
    },
    {
      path: '/customers/:id',
      name: 'customer-profile',
      component: CustomerProfileView,
      props: true,
      meta: { title: 'Customer' }
    },
    {
      path: '/stock',
      name: 'stock',
      component: StockView,
      meta: { title: 'Stock' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { title: 'Settings' }
    }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
