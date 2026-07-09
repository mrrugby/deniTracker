<script setup>
import { useToast } from '../composables/useToast';

const { toasts, removeToast } = useToast();
</script>

<template>
  <div class="toast-stack" aria-live="polite" aria-atomic="true">
    <transition-group name="toast">
      <article
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-card"
        :class="`toast-${toast.tone}`"
      >
        <p>{{ toast.message }}</p>
        <button type="button" class="toast-close" @click="removeToast(toast.id)">x</button>
      </article>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  inset: auto 0 calc(5.5rem + env(safe-area-inset-bottom, 0px)) 0;
  z-index: 70;
  display: grid;
  gap: 0.75rem;
  justify-items: center;
  padding: 0 1rem;
  pointer-events: none;
}

.toast-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: min(100%, 32rem);
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  color: white;
  box-shadow: 0 12px 32px rgba(15, 23, 21, 0.22);
  pointer-events: auto;
}

.toast-card p {
  margin: 0;
  flex: 1;
  font-size: 0.95rem;
}

.toast-success {
  background: #226b57;
}

.toast-error {
  background: #a5423b;
}

.toast-warning {
  background: #b36b1d;
}

.toast-close {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 1rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
