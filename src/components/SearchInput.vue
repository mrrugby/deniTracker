<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search'
  }
});

defineEmits(['update:modelValue']);
</script>

<template>
  <label class="search-input">
    <span>/</span>
    <input
      :value="modelValue"
      :placeholder="placeholder"
      type="search"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>

<style scoped>
.search-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.95rem 1rem;
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(23, 68, 59, 0.08);
}

.search-input span {
  color: var(--muted);
  font-weight: 700;
}

.search-input input {
  width: 100%;
  border: 0;
  background: transparent;
  font: inherit;
  color: inherit;
}

.search-input input:focus {
  outline: none;
}
</style>
