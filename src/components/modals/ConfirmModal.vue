<script setup>
import BaseModal from '../BaseModal.vue';

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm action'
  },
  description: {
    type: String,
    default: ''
  },
  confirmLabel: {
    type: String,
    default: 'Confirm'
  }
});

defineEmits(['close', 'confirm']);
</script>

<template>
  <BaseModal :open="open" :title="title" :description="description" @close="$emit('close')">
    <div class="confirm-body">
      <slot />
    </div>

    <template #footer>
      <div class="modal-actions">
        <button type="button" class="ghost-button" @click="$emit('close')">Cancel</button>
        <button type="button" class="danger-button" @click="$emit('confirm')">{{ confirmLabel }}</button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm-body {
  color: var(--muted);
}
</style>
