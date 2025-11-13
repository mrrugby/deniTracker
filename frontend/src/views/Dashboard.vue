<template>
  <div class="dashboard">
    <!-- Top Navigation -->
    <TopNav />

   
    <!-- Summary cards -->
    <section class="cards">
      <div class="card red">
        <div class="card-header red">
          <span class="material-symbols-outlined">error</span>
          <p>Total Debt</p>
        </div>
        <p class="card-value red">{{ totalDebt.toFixed(2) }} Ksh</p>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="material-symbols-outlined">account_balance</span>
          <p>Total Repaid</p>
        </div>
        <p class="card-value">{{ totalPayments.toFixed(2) }} Ksh</p>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="actions-section">
      <h2>Quick Actions</h2>
      <div class="actions">
        <button class="action primary" @click="showAddTransaction = true">
          <span class="material-symbols-outlined">add_circle</span>
          <span>Add Transaction</span>
        </button>
        <button class="action" @click="showAddCustomer = true">
          <span class="material-symbols-outlined">person_add</span>
          <span>Add Customer</span>
        </button>
        <button class="action">
          <span class="material-symbols-outlined">add_shopping_cart</span>
          <span>Add Stock</span>
        </button>
      </div>
    </section>

    <!-- Transactions -->
    <section class="transactions-section">
      <h2>Recent Transactions</h2>
      <p v-if="transactions.length === 0" class="empty-text">No transactions yet.</p>

      <div v-else class="transactions">
        <div
          v-for="tx in transactions"
          :key="tx.id"
          class="transaction"
          @click="goToCustomer(tx.customer_id)"
        >
          <div
            class="icon"
            :class="tx.transaction_type === 'payment' ? 'in' : 'out'"
          >
            <span class="material-symbols-outlined">
              {{ tx.transaction_type === 'payment' ? 'arrow_downward' : 'arrow_upward' }}
            </span>
          </div>
          <div class="info">
            <p class="name">{{ tx.customer_name }}</p>
            <small class="desc">{{ tx.description || 'No description' }}</small>
          </div>
          <div
            class="amount"
            :class="tx.transaction_type === 'payment' ? 'in' : 'out'"
          >
            <p>
              {{ tx.transaction_type === 'payment' ? '+' : '-' }}
              {{ tx.amount.toFixed(2) }} Ksh
            </p>
            <p class="date">{{ new Date(tx.date).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Modals -->
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

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchCustomers, addCustomer, addTransaction } from "@/services/api";
import TopNav from "@/components/TopNav.vue";
import BottomNav from "@/components/BottomNav.vue";

const router = useRouter();

const customers = ref([]);
const transactions = ref([]);
const totalDebt = ref(0);
const totalPayments = ref(0);
const API_BASE = import.meta.env.VITE_API_BASE;

const showAddCustomer = ref(false);
const showAddTransaction = ref(false);

const newCustomer = ref({ name: "", phone: "" });
const transaction = ref({ customerId: "", type: "", amount: null, description: "" });

async function loadData() {
  const data = await fetchCustomers();
  customers.value = data.map(c => ({
    ...c,
    total_debt: parseFloat(c.total_debt || 0),
    total_payments: parseFloat(c.total_payments || 0),
  }));
  totalDebt.value = customers.value.reduce((s, c) => s + c.total_debt, 0);
  totalPayments.value = customers.value.reduce((s, c) => s + c.total_payments, 0);
}

async function fetchTransactions() {
  const res = await fetch(`${API_BASE}/transactions/`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  const data = await res.json();
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
  if (!id) return alert("Customer not found for this transaction.");
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
  if (!transaction.value.customerId || !transaction.value.type)
    return alert("Please fill all fields.");

  await addTransaction(transaction.value.customerId, transaction.value.type, {
    amount: transaction.value.amount,
    description: transaction.value.description,
  });

  alert("Transaction added!");
  showAddTransaction.value = false;
  transaction.value = { customerId: "", type: "", amount: null, description: "" };
  await loadData();
  await fetchTransactions();
}

onMounted(async () => {
  await loadData();
  await fetchTransactions();
});
</script>


<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined");

/* === Base Layout === */
.dashboard {
  font-family: "Inter", sans-serif;
  background: #f8fafc;
  color: #0f172a;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 3rem;
}

/* === Header === */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.2rem;
  border-bottom: 1px solid #e2e8f0;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 200;
  font-size: 1rem;
}
.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 1.5rem;
}

/* === Cards === */
.cards {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  padding: 1rem;
}
.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.3rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}
.card-value {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 0.1rem;
}
.red {
  color: #dc2626;
}
.green {
  color: #059669;
}

/* === Actions === */
.actions-section {
  padding: 0 1rem;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.action {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 1.15rem;
  cursor: pointer;
  transition: background 0.3s;
}
.action.primary {
  background: #059669;
  color: white;
  border: none;
}
.action:hover {
  background: #b2bcc5;
}

/* === Transactions === */
.transactions-section {
  padding: 0 1rem 1rem 1rem;
}
.transactions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.transaction {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.2rem;
  background: white;
  cursor: pointer;
  transition: transform 0.2s;
}
.transaction:hover {
  transform: translateY(-2px);
}
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  width: 3rem;
  border-radius: 9999px;
}
.icon.in {
  background: #dcfce7;
  color: #16a34a;
}
.icon.out {
  background: #fee2e2;
  color: #dc2626;
}
.amount {
  margin-left: auto;
  text-align: right;
  font-weight: 700;
}
.amount.in {
  color: #16a34a;
}
.amount.out {
  color: #dc2626;
}
.date {
  font-size: 0.75rem;
  color: #64748b;
}

/* === Modals === */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  width: 90%;
  max-width: 420px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}
.modal-content input,
.modal-content select {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.btn.primary {
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 1.2rem;
}
.btn.cancel {
  background: #9ca3af;
  color: #fff;
  border-radius: 0.5rem;
  padding: 0.6rem 1.2rem;
}
</style>
