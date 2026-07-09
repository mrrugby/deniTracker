<script setup>
defineProps({
  title: {
    type: String,
    default: 'Nothing here yet'
  },
  description: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <section class="empty-state">
    <div class="empty-icon">+</div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <slot />
  </section>
</template>

<style scoped>
.empty-state {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  padding: 1.4rem;
  border-radius: 1.4rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.74);
  border: 1px dashed rgba(23, 68, 59, 0.16);
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: rgba(23, 68, 59, 0.08);
  color: var(--accent);
  font-size: 1.3rem;
}

h3,
p {
  margin: 0;
}

p {
  color: var(--muted);
  max-width: 22rem;
}
</style>
