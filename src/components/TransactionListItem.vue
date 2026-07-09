<script setup>
import { computed } from 'vue';
import { formatCurrency, formatDateTime } from '../local';

const props = defineProps({
  transaction: {
    type: Object,
    default: () => ({})
  }
});

const tone = computed(() => props.transaction.transaction_type === 'payment' ? 'payment' : 'debt');
</script>

<template>
  <button class="transaction-item" :class="tone" type="button">
    <div>
      <span class="tag">{{ transaction.transaction_type === 'payment' ? 'Payment' : 'Debt' }}</span>
      <h4>{{ transaction.customer_name || 'Unknown customer' }}</h4>
      <p>{{ transaction.description || 'No description' }}</p>
    </div>

    <div class="transaction-meta">
      <strong>{{ formatCurrency(transaction.amount) }}</strong>
      <small>{{ formatDateTime(transaction.date || transaction.created_at) }}</small>
    </div>
  </button>
</template>

<style scoped>
.transaction-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border: 0;
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.86);
  text-align: left;
  color: inherit;
}

.transaction-item h4,
.transaction-item p {
  margin: 0;
}

.transaction-item p {
  margin-top: 0.25rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.tag {
  display: inline-flex;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: rgba(23, 68, 59, 0.08);
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 700;
  margin-bottom: 0.55rem;
}

.transaction-meta {
  text-align: right;
}

.transaction-meta strong {
  display: block;
  font-size: 0.98rem;
}

.transaction-meta small {
  display: block;
  margin-top: 0.25rem;
  color: var(--muted);
  font-size: 0.76rem;
}

.payment {
  border-left: 4px solid #226b57;
}

.debt {
  border-left: 4px solid #cb7c47;
}
</style>
