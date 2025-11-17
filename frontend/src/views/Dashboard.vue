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
        <p class="card-value red">{{ totalDebt.toLocaleString() }} Ksh</p>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="material-symbols-outlined">account_balance</span>
          <p>Total Repaid</p>
        </div>
        <p class="card-value">{{ totalPayments.toLocaleString() }} Ksh</p>
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

    <!-- Recent Transactions -->
    <section class="transactions-section">
      <h2>Recent Transactions</h2>
      <p v-if="transactions.length === 0" class="empty-text">No transactions yet.</p>

      <div v-else class="transactions">
        <div
          v-for="tx in sortedTransactions"
          :key="tx.id"
          class="transaction"
          @click="goToCustomer(tx.customer_id)"
        >
          <div class="icon" :class="tx.transaction_type === 'payment' ? 'in' : 'out'">
            <span class="material-symbols-outlined">
              {{ tx.transaction_type === 'payment' ? 'arrow_downward' : 'arrow_upward' }}
            </span>
          </div>
          <div class="info">
            <p class="name">{{ tx.customer_name }}</p>
            <small class="desc">{{ tx.description || 'No description' }}</small>
          </div>
          <div class="amount" :class="tx.transaction_type === 'payment' ? 'in' : 'out'">
            <p>
              {{ tx.transaction_type === 'payment' ? '+' : '-' }}
              {{ Number(tx.amount).toLocaleString() }} Ksh
            </p>
            <p class="date">
              {{ new Date(tx.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Add Customer Modal -->
    <div v-if="showAddCustomer" class="modal-backdrop" @click="showAddCustomer = false">
      <div class="modal-content" @click.stop>
        <h3>Add Customer</h3>
        <div class="input-group">
          <label>Customer Name</label>
          <input v-model="newCustomer.name" type="text" placeholder="Enter name" autofocus />
        </div>
        <div class="input-group">
          <label>Phone Number</label>
          <input v-model="newCustomer.phone" type="text" placeholder="e.g. 0712345678" />
        </div>
        <div class="modal-actions">
          <button @click="submitCustomer" class="btn primary">Save</button>
          <button @click="showAddCustomer = false" class="btn cancel">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Add Transaction Modal with CUSTOM DROPDOWNS -->
    <div v-if="showAddTransaction" class="modal-backdrop" @click="closeTransactionModal">
      <div class="modal-content" @click.stop>
        <h3>Add Transaction</h3>

        <!-- CUSTOMER DROPDOWN -->
        <div class="input-group">
          <label>Customer</label>
          <div class="custom-select-wrapper">
            <button
              class="custom-select-display"
              @click="showCustomerDropdown = !showCustomerDropdown"
              :aria-expanded="showCustomerDropdown"
            >
              <span>{{ selectedCustomerName || 'Select customer' }}</span>
              <span class="material-symbols-outlined dropdown-icon">expand_more</span>
            </button>

            <div v-if="showCustomerDropdown" class="custom-select-dropdown">
              <div
                v-for="c in customers"
                :key="c.id"
                class="custom-select-option"
                :class="{ active: transaction.customerId === c.id }"
                @click="selectCustomer(c.id, c.name)"
              >
                {{ c.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- TYPE DROPDOWN -->
        <div class="input-group">
          <label>Transaction Type</label>
          <div class="custom-select-wrapper">
            <button
              class="custom-select-display"
              @click="showTypeDropdown = !showTypeDropdown"
              :aria-expanded="showTypeDropdown"
            >
              <span>{{ transaction.type ? (transaction.type === 'payment' ? 'Payment' : 'Debt') : 'Select type' }}</span>
              <span class="material-symbols-outlined dropdown-icon">expand_more</span>
            </button>

            <div v-if="showTypeDropdown" class="custom-select-dropdown">
              <div
                class="custom-select-option"
                :class="{ active: transaction.type === 'payment' }"
                @click="transaction.type = 'payment'; showTypeDropdown = false"
              >
                Payment
              </div>
              <div
                class="custom-select-option"
                :class="{ active: transaction.type === 'debt' }"
                @click="transaction.type = 'debt'; showTypeDropdown = false"
              >
                Debt
              </div>
            </div>
          </div>
        </div>

        <!-- Conditional Fields -->
        <div v-if="transaction.type === 'payment'">
          <div class="input-group">
            <label>Amount (Ksh)</label>
            <input type="number" v-model.number="transaction.amount" placeholder="e.g. 500" />
          </div>
        </div>

        <div v-if="transaction.type === 'debt'">
          <div class="input-group">
            <label>Description <small>(optional)</small></label>
            <input type="text" v-model="transaction.description" placeholder="e.g. 2kg sugar" />
          </div>
          <div class="input-group">
            <label>Amount (Ksh)</label>
            <input type="number" v-model.number="transaction.amount" placeholder="e.g. 300" />
          </div>
        </div>

        <div class="modal-actions">
          <button @click="submitTransaction" class="btn primary">Save</button>
          <button @click="closeTransactionModal" class="btn cancel">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
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
const showCustomerDropdown = ref(false);
const showTypeDropdown = ref(false);

const newCustomer = ref({ name: "", phone: "" });
const transaction = ref({ customerId: "", type: "", amount: null, description: "" });

const selectedCustomerName = computed(() => {
  const customer = customers.value.find(c => c.id === transaction.value.customerId);
  return customer ? customer.name : '';
});

const sortedTransactions = computed(() => {
  return [...transactions.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

function selectCustomer(id, name) {
  transaction.value.customerId = id;
  showCustomerDropdown.value = false;
}

function closeTransactionModal() {
  showAddTransaction.value = false;
  showCustomerDropdown.value = false;
  showTypeDropdown.value = false;
}

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
  if (!res.ok) return;
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

  closeTransactionModal();
  transaction.value = { customerId: "", type: "", amount: null, description: "" };
  await loadData();
  await fetchTransactions();
}

onMounted(async () => {
  await loadData();
  await fetchTransactions();

  const closeAllDropdowns = (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
      showCustomerDropdown.value = false;
      showTypeDropdown.value = false;
    }
  };
  document.addEventListener('click', closeAllDropdowns);
  onUnmounted(() => document.removeEventListener('click', closeAllDropdowns));
});
</script>

<style scoped>
.dashboard {
  font-family: "Inter", sans-serif;
  background: #f8fafc;
  color: #0f172a;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 3rem;
}

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
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.card-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.red { color: #dc2626; }

.actions-section,
.transactions-section {
  padding: 0 1rem;
}

.actions-section h2,
.transactions-section h2 {
  font-size: 1.1rem;
  margin: 1.5rem 0 0.75rem;
  color: #1e293b;
  font-weight: 600;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: black;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action.primary {
  background: #059669;
  color: white;
  border: none;
}

.action:hover {
  transform: scale(0.99);
}

.transactions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.transaction {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: transform 0.15s;
}

.transaction:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon.in { background: #dcfce7; color: #16a34a; }
.icon.out { background: #fee2e2; color: #dc2626; }

.info .name {
  font-weight: 600;
  margin: 0;
  font-size: 0.95rem;
}

.info .desc {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0.25rem 0 0;
}

.amount {
  margin-left: auto;
  text-align: right;
  font-weight: 700;
  font-size: 0.95rem;
}

.amount.in { color: #16a34a; }
.amount.out { color: #dc2626; }

.amount .date {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 0.25rem;
  font-weight: 500;
}

.empty-text {
  text-align: center;
  color: #94a3b8;
  padding: 2rem 0;
  font-size: 0.95rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  padding: 1.5rem;
}

.modal-content h3 {
  margin: 0 0 1.5rem;
  text-align: center;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #475569;
  font-weight: 500;
}

.input-group small {
  color: #64748b;
  font-weight: normal;
}

.input-group input {
  width: 100%;
  padding: 0.9rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  flex: 1;
  padding: 0.9rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.primary {
  background: #059669;
  color: white;
}

.btn.cancel {
  background: #e2e8f0;
  color: #475569;
}

/* CUSTOM DROPDOWN STYLES */
.custom-select-wrapper { position: relative; }

.custom-select-display {
  width: 100%;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  font-size: 1.1rem;
  font-weight: 500;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.15s ease;
}

.custom-select-display[aria-expanded="true"] .dropdown-icon {
  transform: rotate(180deg);
}

.custom-select-display span:first-child {
  color: #64748b;
}
.custom-select-display span:first-child:not(:empty) {
  color: #1e293b;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 1.4rem;
  color: #64748b;
  transition: transform 0.15s ease;
}

.custom-select-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
  animation: dropdownIn 0.12s ease;
}

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.custom-select-option {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: background 0.12s;
}

.custom-select-option:hover { background: #f1f5f9; }
.custom-select-option.active {
  background: #e8f0fe;
  color: #1763cf;
  font-weight: 700;
}
</style>