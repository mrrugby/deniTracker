<script setup>
defineProps({
  title: {
    type: String,
    default: 'Debtly'
  },
  subtitle: {
    type: String,
    default: ''
  },
  canGoBack: {
    type: Boolean,
    default: false
  }
});

defineEmits(['back']);
</script>

<template>
  <header class="app-header">
    <div class="header-row">
      <button v-if="canGoBack" type="button" class="icon-button" @click="$emit('back')">
        &lt;
      </button>
      <div>
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
      </div>
      <slot name="action" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: calc(0.85rem + env(safe-area-inset-top, 0px)) 1rem 1rem;
  background:
    linear-gradient(180deg, rgba(244, 239, 229, 0.98), rgba(244, 239, 229, 0.9)),
    var(--shell-bg);
  backdrop-filter: blur(14px);
}

.header-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.eyebrow {
  margin: 0 0 0.2rem;
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

.subtitle {
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-size: 0.95rem;
}
</style>
