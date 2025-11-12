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

    <!-- Action Buttons -->
    <div class="actions">
      <button class="btn primary" @click="showAddTransaction = true">Add Transaction</button>
      <button class="btn secondary" @click="showAddCustomer = true">Add Customer</button>
    </div>

    <!-- Transactions List -->
    <section class="transactions">
      <h2>Recent Transactions</h2>

      <p v-if="transactions.length === 0" class="empty-text">
        No transactions yet.
      </p>

      <ul v-else>
        <li
          v-for="tx in transactions"
          :key="tx.id"
          class="transaction-card clickable"
          @click="goToCustomer(tx.customer_id)"
        >
          <div class="info">
            <h3>{{ tx.customer_name }}</h3>
            <p>
              <strong>{{ tx.transaction_type === 'payment' ? 'Payment' : 'Debt' }}</strong>
              — {{ tx.description || 'No description' }}
            </p>
            <p>Amount: {{ tx.amount.toFixed(2) }} Ksh</p>
            <p class="date">{{ new Date(tx.date).toLocaleString() }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Add Customer Modal -->
    <div v-if="showAddCustomer" class="modal">
      <div class="modal-content">
        <h3>Add Customer</h3>

        <label>Customer Name</label>
        <input v-model="newCustomer.name" type="text" placeholder="Enter name" />

        <label>Phone Number (optional)</label>
        <input v-model="newCustomer.phone" type="text" placeholder="e.g. 0712345678" />

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

        <label>Customer</label>
        <select v-model="transaction.customerId">
          <option disabled value="">Select a customer</option>
          <option v-for="c in customers" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>

        <label>Transaction Type</label>
        <select v-model="transaction.type">
          <option disabled value="">Select type</option>
          <option value="payment">Payment</option>
          <option value="debt">Debt</option>
        </select>

        <div v-if="transaction.type === 'payment'">
          <label>Amount (Ksh)</label>
          <input type="number" v-model.number="transaction.amount" placeholder="e.g. 500" />
        </div>

        <div v-if="transaction.type === 'debt'">
          <label>Description</label>
          <input type="text" v-model="transaction.description" placeholder="e.g. 2kg sugar" />
          <label>Amount (Ksh)</label>
          <input type="number" v-model.number="transaction.amount" placeholder="e.g. 300" />
        </div>

        <div class="modal-actions">
          <button class="btn primary" @click="submitTransaction">Save</button>
          <button class="btn cancel" @click="showAddTransaction = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchCustomers, addCustomer, addTransaction } from "@/services/api";

const router = useRouter();

const customers = ref([]);
const transactions = ref([]);
const totalDebt = ref(0);
const totalPayments = ref(0);
const API_BASE = import.meta.env.VITE_API_BASE;

const showAddCustomer = ref(false);
const showAddTransaction = ref(false);

const newCustomer = ref({
  name: "",
  phone: "",
});

const transaction = ref({
  customerId: "",
  type: "",
  amount: null,
  description: "",
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

async function fetchTransactions() {
  const res = await fetch(`${API_BASE}/transactions/`);
  if (!res.ok) throw new Error("Failed to fetch transactions");

  const data = await res.json();
  console.log("Fetched transactions:", data);

  transactions.value = data.map(tx => ({
    id: tx.id,
    customer_id: tx.customer || null,
    customer_name: tx.customer_name || "Unknown",
    transaction_type: tx.transaction_type || "unknown",
    amount: parseFloat(tx.total_amount || tx.amount || 0),
    description: tx.description || "",
    date: tx.date || tx.created_at || new Date().toISOString(),
  }));
}

function goToCustomer(id) {
  if (!id) {
    alert("Customer not found for this transaction.");
    return;
  }
  router.push(`/customer/${id}`);
}

async function submitCustomer() {
  if (!newCustomer.value.name.trim()) return alert("Customer name is required.");
  await addCustomer(newCustomer.value);
  newCustomer.value = { name: "", phone: "" };
  showAddCustomer.value = false;
  await loadData();
}

async function submitTransaction() {
  if (!transaction.value.customerId) return alert("Please select a customer.");
  if (!transaction.value.type) return alert("Please select a transaction type.");

  if (transaction.value.type === "payment" && !transaction.value.amount) {
    return alert("Enter payment amount.");
  }

  if (transaction.value.type === "debt" && (!transaction.value.amount || !transaction.value.description)) {
    return alert("Enter both description and amount for debt.");
  }

  try {
    await addTransaction(transaction.value.customerId, transaction.value.type, {
      amount: transaction.value.amount,
      description: transaction.value.description,
    });

    alert("Transaction added successfully!");
    showAddTransaction.value = false;
    transaction.value = { customerId: "", type: "", amount: null, description: "" };
    await loadData();
    await fetchTransactions();
  } catch (err) {
    alert("Failed to add transaction: " + err.message);
  }
}

onMounted(async () => {
  await loadData();
  await fetchTransactions();
});
</script>

<style scoped>
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
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.logo h1 {
  font-size: 1.5rem;
}

/* Buttons */
.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease;
}
.btn.primary {
  background-color: #2563eb;
  color: white;
}
.btn.primary:hover {
  background-color: #1d4ed8;
}
.btn.secondary {
  background-color: #f3f4f6;
  color: #111;
}
.btn.secondary:hover {
  background-color: #e5e7eb;
}
.btn.cancel {
  background-color: #9ca3af;
  color: white;
}
.btn.cancel:hover {
  background-color: #6b7280;
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

/* Transactions */
.transactions {
  margin-top: 2rem;
}
.transactions h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}
.transaction-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.8rem;
  padding: 0.8rem 1rem;
  margin-bottom: 0.8rem;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: transform 0.2s, background 0.2s;
}
.transaction-card:hover {
  background: #f9fafb;
  transform: translateY(-2px);
}
.transaction-card.clickable {
  cursor: pointer;
}
.transaction-card .info h3 {
  margin: 0 0 0.25rem;
  font-weight: 600;
}
.transaction-card .info p {
  margin: 0.2rem 0;
  color: #374151;
  font-size: 0.9rem;
}
.transaction-card .info .date {
  color: #6b7280;
  font-size: 0.8rem;
}
.empty-text {
  color: #6b7280;
  text-align: center;
  margin-top: 1rem;
}

/* Modals */
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal-content {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 420px;
  padding: 2rem;
  animation: fadeIn 0.25s ease;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.modal-content h3 {
  margin-bottom: 1.2rem;
  font-size: 1.3rem;
  text-align: center;
  font-weight: 600;
  color: #111827;
}
.modal-content label {
  display: block;
  margin-bottom: 0.35rem;
  font-weight: 500;
  color: #374151;
}
.modal-content input,
.modal-content select {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  background-color: #fff;
}
.modal-content input:focus,
.modal-content select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.2rem;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
