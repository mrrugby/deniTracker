<script setup>
import BaseModal from '../BaseModal.vue';
import { formatCurrency, formatDateTime } from '../../local';

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  transaction: {
    type: Object,
    default: null
  }
});
</script>

<template>
  <BaseModal
    :open="open"
    title="Transaction details"
    description="Once a transaction is recorded, it cannot be changed or deleted."
    @close="$emit('close')"
  >
    <div v-if="transaction" class="details-grid">
      <div class="detail-card">
        <span>Type</span>
        <strong>{{ transaction.transaction_type === 'payment' ? 'Payment' : 'Debt' }}</strong>
      </div>
      <div class="detail-card">
        <span>Amount</span>
        <strong>{{ formatCurrency(transaction.amount) }}</strong>
      </div>
      <div class="detail-card">
        <span>Date</span>
        <strong>{{ formatDateTime(transaction.date || transaction.created_at) }}</strong>
      </div>
      <div class="detail-card">
        <span>Description</span>
        <strong>{{ transaction.description || 'No description' }}</strong>
      </div>

      <div v-if="transaction.items?.length" class="item-list">
        <h3>Items</h3>
        <article v-for="item in transaction.items" :key="`${item.name}-${item.quantity}`" class="item-row">
          <div>
            <strong>{{ item.name }}</strong>
            <p>{{ item.quantity }} x {{ formatCurrency(item.price) }}</p>
          </div>
          <b>{{ formatCurrency(item.total) }}</b>
        </article>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.details-grid {
  display: grid;
  gap: 0.85rem;
}

.detail-card,
.item-list {
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(244, 239, 229, 0.85);
}

.detail-card span {
  display: block;
  color: var(--muted);
  font-size: 0.82rem;
}

.detail-card strong {
  display: block;
  margin-top: 0.35rem;
}

.item-list h3,
.item-row p {
  margin: 0;
}

.item-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.9rem;
}

.item-row p {
  margin-top: 0.2rem;
  color: var(--muted);
  font-size: 0.88rem;
}
</style>
