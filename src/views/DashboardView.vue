<script setup>
import { computed, ref } from 'vue';
import EmptyState from '../components/EmptyState.vue';
import SummaryCard from '../components/SummaryCard.vue';
import TransactionListItem from '../components/TransactionListItem.vue';
import AddCustomerModal from '../components/modals/AddCustomerModal.vue';
import AddTransactionModal from '../components/modals/AddTransactionModal.vue';
import TransactionDetailsModal from '../components/modals/TransactionDetailsModal.vue';
import { useLedger } from '../composables/useLedger';
import { useModalState } from '../composables/useModalState';
import { useToast } from '../composables/useToast';
import { formatCurrency } from '../local';

const ledger = useLedger();
const toast = useToast();
const customerModal = useModalState(false);
const transactionModal = useModalState(false);
const selectedTransaction = ref(null);

const recentTransactions = computed(() => ledger.transactions.value.slice(0, 8));
const topBalances = computed(() => [...ledger.customerSummaries.value]
  .sort((left, right) => right.balance - left.balance)
  .slice(0, 3));

async function handleAddCustomer(payload) {
  try {
    await ledger.addCustomer(payload);
    toast.success('Customer added successfully');
    customerModal.close();
  } catch (error) {
    toast.error(error.message || 'Could not save customer');
  }
}

async function handleAddTransaction(payload) {
  try {
    if (!payload.customer_id) {
      toast.warning('Choose a customer first');
      return;
    }

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
  <div class="page-stack">
    <section class="hero-card">
      <div>
        <p class="section-kicker">Today at a glance</p>
        <h2>Track debts, payments, and balances.</h2>
      </div>

      <div class="hero-actions">
        <button type="button" class="primary-button" @click="transactionModal.open()">New transaction</button>
        <button type="button" class="secondary-button" @click="customerModal.open()">New customer</button>
      </div>
    </section>

    <section class="summary-grid">
      <SummaryCard label="Outstanding balance" :value="formatCurrency(ledger.dashboardStats.value.balanceOutstanding)" tone="accent" />
      <SummaryCard label="Total debt" :value="formatCurrency(ledger.dashboardStats.value.totalDebt)" tone="warm" />
      <SummaryCard label="Total payments" :value="formatCurrency(ledger.dashboardStats.value.totalPayments)" />
      <SummaryCard label="Customers" :value="String(ledger.dashboardStats.value.customerCount)" />
    </section>

    <section class="section-card">
      <div class="section-head">
        <div>
          <p class="section-kicker">Needs attention</p>
          <h2>Highest balances</h2>
        </div>
      </div>

      <div v-if="topBalances.length" class="mini-list">
        <article v-for="customer in topBalances" :key="customer.id" class="mini-item">
          <div>
            <h3>{{ customer.name }}</h3>
            <p>{{ customer.phone || 'No phone number' }}</p>
          </div>
          <strong>{{ formatCurrency(customer.balance) }}</strong>
        </article>
      </div>

      <EmptyState
        v-else
        title="No balances yet"
        description="Add a customer and record a debt to see live balance summaries here."
      />
    </section>

    <section class="section-card">
      <div class="section-head">
        <div>
          <p class="section-kicker">Recent activity</p>
          <h2>Latest transactions</h2>
        </div>
      </div>

      <div v-if="recentTransactions.length" class="list-stack">
        <TransactionListItem
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          :transaction="transaction"
          @click="selectedTransaction = transaction"
        />
      </div>

      <EmptyState
        v-else
        title="No transactions yet"
        description="Your ledger stays empty until you record the first debt or payment."
      />
    </section>

    <AddCustomerModal
      :open="customerModal.isOpen.value"
      @close="customerModal.close()"
      @save="handleAddCustomer"
    />

    <AddTransactionModal
      :open="transactionModal.isOpen.value"
      :customers="ledger.customerSummaries.value"
      :active-items="ledger.activeItems.value"
      @close="transactionModal.close()"
      @save="handleAddTransaction"
    />

    <TransactionDetailsModal
      :open="!!selectedTransaction"
      :transaction="selectedTransaction"
      @close="selectedTransaction = null"
    />
  </div>
</template>
