<script setup>
import { reactive, watch } from 'vue';
import BaseModal from '../BaseModal.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const form = reactive({
  id: null,
  name: '',
  price: '',
  is_active: true,
  created_at: ''
});

function syncForm() {
  form.id = props.item?.id ?? null;
  form.name = props.item?.name ?? '';
  form.price = props.item?.price ?? '';
  form.is_active = props.item?.is_active ?? true;
  form.created_at = props.item?.created_at ?? '';
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    syncForm();
  }
});

function handleSubmit() {
  emit('save', { ...form });
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="item?.id ? 'Edit item' : 'Add item'"
    description="Adding stock items helps record debt faster."
    @close="$emit('close')"
  >
    <form class="form-grid" @submit.prevent="handleSubmit">
      <label class="field">
        <span>Item name</span>
        <input v-model.trim="form.name" type="text" placeholder="Sugar 2kg" maxlength="80" />
      </label>

      <label class="field">
        <span>Price</span>
        <input v-model="form.price" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" />
      </label>

      <label class="switch-field">
        <span>Available for sale</span>
        <input v-model="form.is_active" type="checkbox" />
      </label>

      <div class="modal-actions">
        <button type="button" class="ghost-button" @click="$emit('close')">Cancel</button>
        <button type="submit" class="primary-button">{{ item?.id ? 'Update item' : 'Save item' }}</button>
      </div>
    </form>
  </BaseModal>
</template>
