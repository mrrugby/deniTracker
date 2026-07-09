<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import {
  Home,
  Users,
  Package,
  Settings 
} from 'lucide-vue-next';
const route = useRoute();

const navItems = [
  { label: 'Home', route: { name: 'dashboard' }, icon: Home },
  { label: 'Customers', route: { name: 'customers' }, icon: Users },
  { label: 'Stock', route: { name: 'stock' }, icon: Package },
  { label: 'Settings', route: { name: 'settings' }, icon: Settings }
];

const activeRouteName = computed(() => 
route.name === 'customer-profile' 
? 'customers' 
: route.name
);
</script>

<template>
  <nav class="bottom-nav" aria-label="Main navigation">
    <RouterLink
      v-for="item in navItems"
      :key="item.label"
      :to="item.route"
      class="nav-link"
      :class="{ active: activeRouteName === item.route.name }"
    >
      <span class="nav-icon"><component :is="item.icon" /></span>
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  padding: 0.8rem 1rem calc(0.8rem + env(safe-area-inset-bottom, 0px));
  background: rgba(19, 48, 42, 0.96);
  backdrop-filter: blur(14px);
  box-shadow: 0 -12px 32px rgba(16, 40, 35, 0.22);
}

.nav-link {
  display: grid;
  justify-items: center;
  gap: 0.3rem;
  border-radius: 1rem;
  padding: 0.75rem 0.5rem;
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 700;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  transform: translateY(-1px);
}

.nav-icon {
  display: grid;
  place-items: center;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.95rem;
}
</style>
