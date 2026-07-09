<script setup>
import { computed, ref } from 'vue';
import CustomerCard from '../components/CustomerCard.vue';
import EmptyState from '../components/EmptyState.vue';
import SearchInput from '../components/SearchInput.vue';
import AddCustomerModal from '../components/modals/AddCustomerModal.vue';
import { useLedger } from '../composables/useLedger';
import { useModalState } from '../composables/useModalState';
import { useToast } from '../composables/useToast';

const ledger = useLedger();
const toast = useToast();
const customerModal = useModalState(false);
const query = ref('');

const filteredCustomers = computed(() => {
  const term = query.value.trim().toLowerCase();

  if (!term) {
    return ledger.customerSummaries.value;
  }

  return ledger.customerSummaries.value.filter((customer) =>
    customer.name.toLowerCase().includes(term) ||
    customer.phone.toLowerCase().includes(term)
  );
});

async function handleAddCustomer(payload) {
  try {
    await ledger.addCustomer(payload);
    toast.success('Customer added successfully');
    customerModal.close();
  } catch (error) {
    toast.error(error.message || 'Could not save customer');
  }
}
</script>

<template>
  <div class="page-stack">
    <section class="section-card">
      <div class="section-head">
        <div>
          <p class="section-kicker">Customers</p>
          <h2>Search Customers</h2>
        </div>
        <button type="button" class="primary-button" @click="customerModal.open()">Add customer</button>
      </div>

      <SearchInput v-model="query" placeholder="Search by name or phone" />
    </section>

    <section v-if="filteredCustomers.length" class="list-stack">
      <CustomerCard v-for="customer in filteredCustomers" :key="customer.id" :customer="customer" />
    </section>

    <EmptyState
      v-else
      title="No customers found"
      description="Try a different name, or add your first customer."
    >
      <button type="button" class="primary-button" @click="customerModal.open()">Add customer</button>
    </EmptyState>

    <AddCustomerModal
      :open="customerModal.isOpen.value"
      @close="customerModal.close()"
      @save="handleAddCustomer"
    />
  </div>
</template>
