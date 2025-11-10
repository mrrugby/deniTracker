<template>
  <nav class="bottom-navbar">
    <router-link 
      to="/" 
      :class="['nav-link', activeRoute('/')]" 
      class="nav-link"
    >
      🏠
      <span>Dashboard</span>
    </router-link>
    <router-link 
      to="/customers" 
      :class="['nav-link', activeRoute('/customers')]"
    >
      👥
      <span>Customers</span>
    </router-link>
    <router-link 
      to="/transactions" 
      :class="['nav-link', activeRoute('/transactions')]"
    >
      💳
      <span>Transactions</span>
    </router-link>
    <router-link 
      to="/reports" 
      :class="['nav-link', activeRoute('/reports')]"
    >
      📊
      <span>Reports</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const activeRoute = (path) => {
  return route.path === path ? 'active' : '';
};
</script>

<style scoped>
.bottom-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0;
  background-color: #fff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -1px 4px rgba(0,0,0,0.05);
  z-index: 50;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.75rem;
  text-decoration: none;
  color: #6b7280;
  transition: color 0.2s ease;
}

.nav-link span {
  font-size: 0.65rem;
}

.nav-link.active {
  color: #1763cf;
}

.nav-link:hover {
  color: #1763cf;
}
</style>
