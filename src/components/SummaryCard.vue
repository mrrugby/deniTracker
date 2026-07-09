<script setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  value: {
    type: String,
    default: ''
  },
  tone: {
    type: String,
    default: 'neutral'
  }
});
</script>

<template>
  <article class="summary-card" :class="`tone-${tone}`">
    <p>{{ label }}</p>
    <h3>{{ value }}</h3>
  </article>
</template>

<style scoped>
.summary-card {
  padding: 1rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(23, 68, 59, 0.08);
}

.summary-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.summary-card h3 {
  margin: 0.35rem 0 0;
  font-size: 1.2rem;
}

.tone-accent {
  background: linear-gradient(135deg, rgba(23, 68, 59, 0.92), rgba(45, 102, 89, 0.88));
  color: white;
}

.tone-accent p {
  color: rgba(255, 255, 255, 0.74);
}

.tone-warm {
  background: linear-gradient(135deg, rgba(203, 124, 71, 0.18), rgba(255, 251, 245, 0.94));
}
</style>
