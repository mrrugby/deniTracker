<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import EmptyState from '../components/EmptyState.vue';
import SearchInput from '../components/SearchInput.vue';
import SummaryCard from '../components/SummaryCard.vue';
import TransactionListItem from '../components/TransactionListItem.vue';
import AddTransactionModal from '../components/modals/AddTransactionModal.vue';
import TransactionDetailsModal from '../components/modals/TransactionDetailsModal.vue';
import { useLedger } from '../composables/useLedger';
import { useModalState } from '../composables/useModalState';
import { useToast } from '../composables/useToast';
import { formatCurrency } from '../local';

const route = useRoute();
const ledger = useLedger();
const toast = useToast();
const transactionModal = useModalState(false);
const transactionMode = ref('debt');
const selectedTransaction = ref(null);
const query = ref('');

const customerId = computed(() => Number(route.params.id));
const customer = computed(() => ledger.findCustomerById(customerId.value));
const summary = computed(() => ledger.getCustomerSummary(customerId.value));
const transactions = computed(() => {
  const term = query.value.trim().toLowerCase();
  const list = ledger.getTransactionsByCustomer(customerId.value);

  if (!term) {
    return list;
  }

  return list.filter((transaction) => {
    const haystack = [
      transaction.customer_name,
      transaction.description,
      transaction.transaction_type
    ].join(' ').toLowerCase();

    return haystack.includes(term);
  });
});

function openTransaction(mode) {
  transactionMode.value = mode;
  transactionModal.open();
}

async function handleSaveTransaction(payload) {
  try {
    if (payload.transaction_type === 'debt' && payload.items.length === 0 && Number(payload.amount) <= 0) {
      toast.warning('Enter a debt amount or select at least one item');
      return;
    }

    await ledger.recordTransaction(payload);
    toast.success(payload.transaction_type === 'payment'
      ? 'Payment recorded successfully'
      : 'Debt recorded successfully');
    transactionModal.close();
  } catch (error) {
    toast.error(error.message || 'Could not save transaction');
  }
}
</script>

<template>
  <div v-if="customer" class="page-stack">
    <section class="hero-card compact">
      <div class="profile-head">
        <div>
          <p class="section-kicker">Customer profile</p>
          <h2>{{ customer.name }}</h2>
          <p class="hero-support">{{ customer.phone || 'No phone number saved' }}</p>
        </div>
        <div class="balance-chip" :class="{ positive: summary.balance <= 0 }">
          {{ formatCurrency(summary.balance) }}
        </div>
      </div>

      <div class="action-row">
        <button type="button" class="primary-button" @click="openTransaction('debt')">Add debt</button>
        <button type="button" class="secondary-button" @click="openTransaction('payment')">Add payment</button>
      </div>
    </section>

    <section class="summary-grid">
      <SummaryCard label="Total debt" :value="formatCurrency(summary.totalDebt)" tone="warm" />
      <SummaryCard label="Total payments" :value="formatCurrency(summary.totalPayments)" />
      <SummaryCard label="Balance" :value="formatCurrency(summary.balance)" tone="accent" />
    </section>

    <section class="section-card">
      <div class="section-head">
        <div>
          <p class="section-kicker">Ledger history</p>
          <h2>All transactions</h2>
        </div>
      </div>

      <SearchInput v-model="query" placeholder="Search this customer's history" />

      <div v-if="transactions.length" class="list-stack transaction-stack">
        <TransactionListItem
          v-for="transaction in transactions"
          :key="transaction.id"
          :transaction="transaction"
          @click="selectedTransaction = transaction"
        />
      </div>

      <EmptyState
        v-else
        title="No matching transactions"
        description="Record a debt or payment to start building this customer's ledger."
      />
    </section>

    <AddTransactionModal
      :open="transactionModal.isOpen.value"
      :customers="ledger.customerSummaries.value"
      :active-items="ledger.activeItems.value"
      :preselected-customer-id="customerId"
      :default-mode="transactionMode"
      @close="transactionModal.close()"
      @save="handleSaveTransaction"
    />

    <TransactionDetailsModal
      :open="!!selectedTransaction"
      :transaction="selectedTransaction"
      @close="selectedTransaction = null"
    />
  </div>

  <EmptyState
    v-else
    title="Customer not found"
    description="The selected profile is missing or was removed from this device."
  />
</template>

<style scoped>
.profile-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.hero-support {
  margin: 0.3rem 0 0;
  color: rgba(255, 255, 255, 0.74);
}

.balance-chip {
  padding: 0.75rem 0.95rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-weight: 700;
}

.balance-chip.positive {
  background: rgba(34, 107, 87, 0.22);
}

.transaction-stack {
  margin-top: 1rem;
}
</style>
