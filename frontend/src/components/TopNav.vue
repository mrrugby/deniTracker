<template>
  <header class="header">
    <div class="logo">
      <span class="material-symbols-outlined green">account_balance_wallet</span>
      <h1>DEBTLY</h1>
    </div>
    <button class="icon-btn">
      <span class="material-symbols-outlined">settings</span>
    </button>
  </header>
</template>

<script setup></script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined");

/* === Header === */
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.2rem;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 200;
  font-size: 1rem;
}
.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 1.5rem;
}
.green {
  color: #059669;
}
</style>
