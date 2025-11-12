<template>
  <nav class="bottom-nav">
    <a class="active">
      <span class="material-symbols-outlined">dashboard</span>
      Dashboard
    </a>
    <a>
      <span class="material-symbols-outlined">group</span>
      Customers
    </a>
    <a>
      <span class="material-symbols-outlined">receipt_long</span>
      Transactions
    </a>
    <a>
      <span class="material-symbols-outlined">inventory_2</span>
      Stock
    </a>
  </nav>
</template>

<script setup></script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined");

/* === Bottom Navigation === */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  padding: 0.5rem 0;
}
.bottom-nav a {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #64748b;
  font-size: 0.75rem;
  text-decoration: none;
}
.bottom-nav a.active {
  color: #059669;
  font-weight: 700;
}
</style>
