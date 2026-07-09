<script setup>
import { onBeforeUnmount, onMounted } from 'vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

function onEscape(event) {
  if (event.key === 'Escape' && props.open) {
    emit('close');
  }
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', onEscape);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEscape);
});
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="open" class="modal-shell" role="presentation">
        <div class="modal-overlay" @click="handleOverlayClick" />
        <section class="modal-card" role="dialog" aria-modal="true" :aria-label="title || 'Modal dialog'">
          <header class="modal-header">
            <div>
              <h2 class="modal-title">{{ title }}</h2>
              <p v-if="description" class="modal-description">{{ description }}</p>
            </div>
            <button class="icon-button" type="button" aria-label="Close modal" @click="$emit('close')">
              x
            </button>
          </header>

          <div class="modal-body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal-shell {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: end center;
  padding: 1rem;
}

.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 21, 0.56);
  backdrop-filter: blur(4px);
}

.modal-card {
  position: relative;
  width: min(100%, 34rem);
  max-height: min(90vh, 46rem);
  overflow: auto;
  border-radius: 1.5rem;
  background: rgba(255, 251, 245, 0.98);
  box-shadow: 0 24px 64px rgba(17, 43, 37, 0.24);
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1rem 0;
}

.modal-title {
  margin: 0;
  font-size: 1.05rem;
}

.modal-description {
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-size: 0.92rem;
}

.modal-body {
  padding: 1rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
