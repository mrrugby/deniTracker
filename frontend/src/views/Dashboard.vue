<template>
  <div class="dashboard">
    <!-- Top Bar -->
    <header class="top-bar">
      <div class="logo">
        <span class="icon">💰</span>
        <h1>DeniTracker</h1>
      </div>
      
    </header>

    <!-- Summary Cards -->
    <section class="summary-cards">
      <div class="card">
        <p>Total Debt</p>
        <h2>{{ totalDebt.toFixed(2) }} Ksh</h2>
      </div>
      <div class="card">
        <p>Total Repaid</p>
        <h2>{{ totalPayments.toFixed(2) }} Ksh</h2>
      </div>
    </section>

    <div class="actions">
        <button class="btn primary" @click="showAddTransaction = true">Add Transaction</button>
        <button class="btn secondary" @click="showAddCustomer = true">Add Customer</button>
      </div>

    <!-- Customers List -->
    <section class="customers">
      <h2>Customers</h2>
      <ul>
        <li
          v-for="customer in customers"
          :key="customer.id"
          class="customer-card"
          @click="goToCustomer(customer.id)"
        >
          <div class="info">
            <h3>{{ customer.name }}</h3>
            <p>Debt: {{ customer.total_debt.toFixed(2) }} Ksh</p>
            <p>Payments: {{ customer.total_payments.toFixed(2) }} Ksh</p>
            <strong>Balance: {{ (customer.total_debt - customer.total_payments).toFixed(2) }} Ksh</strong>
          </div>
        </li>
      </ul>
    </section>

    <!-- Add Customer Modal -->
    <div v-if="showAddCustomer" class="modal">
      <div class="modal-content">
        <h3>Add Customer</h3>
        <input v-model="newCustomer.name" type="text" placeholder="Customer Name" />
        <input v-model="newCustomer.phone" type="text" placeholder="Phone Number (optional)" />
        <div class="modal-actions">
          <button class="btn primary" @click="submitCustomer">Save</button>
          <button class="btn cancel" @click="showAddCustomer = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Add Transaction Modal -->
    <div v-if="showAddTransaction" class="modal">
      <div class="modal-content">
        <h3>Add Transaction</h3>
        <p>(You can implement this modal later with options for payment or debt)</p>
        <div class="modal-actions">
          <button class="btn primary" @click="showAddTransaction = false">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchCustomers, addCustomer } from "@/services/api";

const router = useRouter();

const customers = ref([]);
const totalDebt = ref(0);
const totalPayments = ref(0);

const showAddCustomer = ref(false);
const showAddTransaction = ref(false);

const newCustomer = ref({
  name: "",
  phone: "",
});

async function loadData() {
  const data = await fetchCustomers();
  customers.value = data.map(c => ({
    ...c,
    total_debt: parseFloat(c.total_debt || 0),
    total_payments: parseFloat(c.total_payments || 0),
  }));
  totalDebt.value = customers.value.reduce((sum, c) => sum + c.total_debt, 0);
  totalPayments.value = customers.value.reduce((sum, c) => sum + c.total_payments, 0);
}

function goToCustomer(id) {
  router.push(`/customer/${id}`);
}

async function submitCustomer() {
  if (!newCustomer.value.name.trim()) return alert("Customer name is required.");
  await addCustomer(newCustomer.value);
  newCustomer.value = { name: "", phone: "" };
  showAddCustomer.value = false;
  await loadData();
}

onMounted(loadData);
</script>

<style scoped>
/* Reset & Layout */
.dashboard {
  font-family: 'Inter', sans-serif;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Top Bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.top-bar .logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.top-bar .logo h1 {
  font-size: 1.5rem;
}
.top-bar .actions button {
  margin-left: 0.5rem;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  border: none;
}
.btn.primary {
  background-color: #2563eb;
  color: white;
}
.btn.secondary {
  background-color: #f3f4f6;
  color: #111;
}
.btn.cancel {
  background-color: #9ca3af;
  color: white;
}

/* Summary Cards */
.summary-cards {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}
.summary-cards .card {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.8rem;
  flex: 1;
  min-width: 200px;
}
.summary-cards .card h2 {
  font-size: 1.5rem;
  margin: 0.5rem 0;
}
.summary-cards .card .positive {
  color: green;
}
.summary-cards .card .negative {
  color: red;
}

/* Customers List */
.customers h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}
.customer-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.8rem;
  padding: 0.8rem;
  margin-bottom: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}
.customer-card:hover {
  background: #f9fafb;
}
.customer-card .info h3 {
  margin: 0 0 0.25rem;
}

/* Modal */
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 1rem;
  border-radius: 0.8rem;
  width: 90%;
  max-width: 400px;
}
.modal-content input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 0.4rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
}
.modal-actions button {
  margin-left: 0.5rem;
}
</style>
