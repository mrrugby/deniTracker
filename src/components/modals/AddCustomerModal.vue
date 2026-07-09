<script setup>
import { reactive, watch } from 'vue';
import BaseModal from '../BaseModal.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

const form = reactive({
  name: '',
  phone: ''
});

function resetForm() {
  form.name = '';
  form.phone = '';
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm();
  }
});

function handleSubmit() {
  emit('save', { name: form.name, phone: form.phone });
}
</script>

<template>
  <BaseModal
    :open="open"
    title="Add customer"
    description="Create a customer profile before recording debt or payment."
    @close="$emit('close')"
  >
    <form class="form-grid" @submit.prevent="handleSubmit">
      <label class="field">
        <span>Name</span>
        <input v-model.trim="form.name" type="text" placeholder="Customer name" maxlength="60" />
      </label>

      <label class="field">
        <span>Phone</span>
        <input v-model.trim="form.phone" type="tel" placeholder="07..." maxlength="20" />
      </label>

      <div class="modal-actions">
        <button type="button" class="ghost-button" @click="$emit('close')">Cancel</button>
        <button type="submit" class="primary-button">Save customer</button>
      </div>
    </form>
  </BaseModal>
</template>
