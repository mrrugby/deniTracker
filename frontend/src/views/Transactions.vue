<template>
  <div class="transactions-page">
    <!-- Top Navigation -->
    <TopNav />

    

    <!-- Search -->
    <section class="search-section">
      <div class="search-bar">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by customer..."
        />
      </div>
    </section>

    <!-- Transactions -->
    <section class="transactions-section">
      <p v-if="filteredTransactions.length === 0" class="empty-text">
        No transactions found.
      </p>

      <div
        v-for="tx in filteredTransactions"
        :key="tx.id"
        class="transaction-card"
        @click="goToCustomer(tx.customer_id)"
      >
        <div class="tx-info">
          <div
            class="icon"
            :class="tx.transaction_type === 'payment' ? 'in' : 'out'"
          >
            <span class="material-symbols-outlined">
              {{ tx.transaction_type === "payment" ? "arrow_downward" : "arrow_upward" }}
            </span>
          </div>
          <div class="tx-details">
            <p class="name">{{ tx.customer_name }}</p>
            <p class="desc">{{ tx.description || "No description" }}</p>
          </div>
        </div>

        <div class="tx-meta">
          <p
            class="amount"
            :class="tx.transaction_type === 'payment' ? 'in' : 'out'"
          >
            {{ tx.transaction_type === "payment" ? "+" : "-" }}
            {{ tx.amount.toFixed(2) }} Ksh
          </p>
          <p class="date">
            {{ new Date(tx.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
          </p>
        </div>
      </div>
    </section>

    <!-- Floating Add Button -->
    <button class="fab" @click="showAddTransaction = true">
      <span class="material-symbols-outlined">add</span>
    </button>

    <!-- Add Transaction Modal -->
    <div v-if="showAddTransaction" class="modal">
      <div class="modal-content">
        <h3>Add Transaction</h3>

        <label>Customer</label>
        <select v-model="transaction.customerId">
          <option disabled value="">Select a customer</option>
          <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>

        <label>Transaction Type</label>
        <select v-model="transaction.type">
          <option disabled value="">Select type</option>
          <option value="payment">Payment</option>
          <option value="debt">Debt</option>
        </select>

        <label>Amount (Ksh)</label>
        <input type="number" v-model.number="transaction.amount" placeholder="e.g. 500" />

        <label>Description</label>
        <input type="text" v-model="transaction.description" placeholder="Optional description" />

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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchCustomers, addTransaction } from "@/services/api";
import TopNav from "@/components/TopNav.vue";
import BottomNav from "@/components/BottomNav.vue";

const router = useRouter();
const API_BASE = import.meta.env.VITE_API_BASE;

const customers = ref([]);
const transactions = ref([]);
const searchQuery = ref("");
const showAddTransaction = ref(false);
const transaction = ref({ customerId: "", type: "", amount: null, description: "" });

const filteredTransactions = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return transactions.value.filter(
    (tx) =>
      tx.customer_name.toLowerCase().includes(q) ||
      (tx.description && tx.description.toLowerCase().includes(q))
  );
});

function goToCustomer(id) {
  if (!id) return alert("Customer not found for this transaction.");
  router.push(`/customer/${id}`);
}

async function fetchTransactions() {
  const res = await fetch(`${API_BASE}/transactions/`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  const data = await res.json();
  transactions.value = data.map((tx) => ({
    id: tx.id,
    customer_id: tx.customer || null,
    customer_name: tx.customer_name || "Unknown",
    transaction_type: tx.transaction_type || "unknown",
    amount: parseFloat(tx.total_amount || tx.amount || 0),
    description: tx.description || "",
    date: tx.date || tx.created_at || new Date().toISOString(),
  }));
}

async function loadCustomers() {
  customers.value = await fetchCustomers();
}

async function submitTransaction() {
  if (!transaction.value.customerId || !transaction.value.type)
    return alert("Please fill all fields.");
  await addTransaction(transaction.value.customerId, transaction.value.type, {
    amount: transaction.value.amount,
    description: transaction.value.description,
  });
  showAddTransaction.value = false;
  transaction.value = { customerId: "", type: "", amount: null, description: "" };
  await fetchTransactions();
}

onMounted(async () => {
  await loadCustomers();
  await fetchTransactions();
});
</script>

<style scoped>
.transactions-page {
  font-family: "Inter", sans-serif;
  background: #f9f9f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}


/* Search Bar */
.search-section {
  padding: 0.5rem 1rem;
}

.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  padding: 0.4rem 0.6rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.search-icon {
  color: #6b7280;
  font-size: 1.4rem;
  margin-right: 0.3rem;
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  font-weight: bold;
  background: transparent;
}

/* Transactions List */
.transactions-section {
  flex: 1;
  padding: 0.5rem 1rem 5rem;
}

.transaction-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 0.9rem;
  padding: 0.9rem 1rem;
  margin-bottom: 0.6rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.tx-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  height: 2.5rem;
  width: 2.5rem;
}

.icon.in {
  background: rgba(16, 124, 65, 0.1);
  color: #107c41;
}

.icon.out {
  background: rgba(217, 76, 76, 0.1);
  color: #d94c4c;
}

.tx-details .name {
  font-weight: 600;
  font-size: 0.95rem;
}

.tx-details .desc {
  font-size: 0.8rem;
  color: #6b7280;
}

.tx-meta {
  text-align: right;
}

.tx-meta .amount {
  font-weight: 600;
  font-size: 0.9rem;
}

.tx-meta .amount.in {
  color: #107c41;
}

.tx-meta .amount.out {
  color: #d94c4c;
}

.tx-meta .date {
  font-size: 0.7rem;
  color: #6b7280;
}

.empty-text {
  text-align: center;
  font-size: 0.9rem;
  color: #94a3b8;
  padding-top: 1rem;
}

/* Floating Button */
.fab {
  position: fixed;
  bottom: 4.5rem;
  right: 1.5rem;
  width: 3.5rem;
  height: 3.5rem;
  background: #005a9c;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.15s ease;
}

.fab:hover {
  transform: scale(1.05);
}

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  border-radius: 0.9rem;
  padding: 1.2rem;
  width: 90%;
  max-width: 380px;
}

.modal-content h3 {
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
}

.modal-content label {
  display: block;
  font-size: 0.8rem;
  margin-top: 0.6rem;
  margin-bottom: 0.2rem;
  color: #334155;
}

.modal-content input,
.modal-content select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.8rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.6rem;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn.primary {
  background: #005a9c;
  color: white;
}

.btn.cancel {
  background: #f1f5f9;
}
</style>
