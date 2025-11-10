<template>
  <nav class="bottom-navbar">
    <router-link to="/" class="nav-link" :class="{ active: isActive('/') }">
      🏠<span>Dashboard</span>
    </router-link>
    <router-link to="/customers" class="nav-link" :class="{ active: isActive('/customers') }">
      👥<span>Customers</span>
    </router-link>
    <router-link to="/transactions" class="nav-link" :class="{ active: isActive('/transactions') }">
      💳<span>Transactions</span>
    </router-link>
    <router-link to="/reports" class="nav-link" :class="{ active: isActive('/reports') }">
      📊<span>Reports</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
const isActive = (path) => route.path === path;
</script>

<style scoped>
.bottom-navbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  padding: 0.5rem 0;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.75rem;
  text-decoration: none;
  color: #6b7280;
}
.nav-link span { font-size: 0.65rem; }
.nav-link.active { color: #1763cf; font-weight: bold; }
</style>
