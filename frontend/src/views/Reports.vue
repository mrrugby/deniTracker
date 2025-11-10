<template>
  <div class="page">
    <header class="page-header">
      <h1>Reports</h1>
    </header>
    <main class="page-content">
      <p>Reports and analytics will appear here.</p>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  padding: 1rem;
  background: #f6f7f8;
}

.page-header {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.page-content {
  flex: 1;
  font-size: 1rem;
  color: #111821;
}
</style>
