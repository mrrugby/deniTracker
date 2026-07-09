<script setup>
import { computed } from 'vue';
import { formatCurrency } from '../local';

const props = defineProps({
  customer: {
    type: Object,
    default: () => ({})
  }
});

const balanceTone = computed(() => props.customer.balance > 0 ? 'danger' : 'safe');
</script>

<template>
  <RouterLink class="customer-card" :to="{ name: 'customer-profile', params: { id: customer.id } }">
    <div class="customer-card__top">
      <div>
        <h3>{{ customer.name || 'Unnamed customer' }}</h3>
        <p>{{ customer.phone || 'No phone number' }}</p>
      </div>
      <strong :class="balanceTone">{{ formatCurrency(customer.balance) }}</strong>
    </div>

    <div class="customer-card__stats">
      <div>
        <span>Debt</span>
        <b>{{ formatCurrency(customer.totalDebt) }}</b>
      </div>
      <div>
        <span>Paid</span>
        <b>{{ formatCurrency(customer.totalPayments) }}</b>
      </div>
      <div>
        <span>Entries</span>
        <b>{{ customer.transactions || 0 }}</b>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.customer-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.3rem;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(23, 68, 59, 0.08);
  text-decoration: none;
  color: inherit;
}

.customer-card__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

h3 {
  margin: 0;
  font-size: 1.02rem;
}

p {
  margin: 0.3rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}

strong {
  align-self: start;
  font-size: 1rem;
}

.danger {
  color: #a5423b;
}

.safe {
  color: #226b57;
}

.customer-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.customer-card__stats div {
  padding: 0.8rem;
  border-radius: 1rem;
  background: rgba(244, 239, 229, 0.88);
}

.customer-card__stats span {
  display: block;
  color: var(--muted);
  font-size: 0.78rem;
}

.customer-card__stats b {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.9rem;
}
</style>
