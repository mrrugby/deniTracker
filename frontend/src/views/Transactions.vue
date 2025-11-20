<template>
  <div class="transactions-page">
    <TopNav />

    <!-- Search -->
    <section class="search-section">
      <div class="search-bar">
        <span class="material-symbols-outlined search-icon">search</span>
        <input v-model="searchQuery" type="text" placeholder="Search by customer..." />
      </div>
    </section>

    <!-- Transactions List -->
    <section class="transactions-section">
      <p v-if="filteredTransactions.length === 0" class="empty-text">No transactions found.</p>

      <div
        v-for="tx in filteredTransactions"
        :key="tx.id"
        class="transaction-card"
        @click="goToCustomer(tx.customer_id)"
      >
        <div class="tx-info">
          <div class="icon" :class="tx.transaction_type === 'payment' ? 'in' : 'out'">
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
          <p class="amount" :class="tx.transaction_type === 'payment' ? 'in' : 'out'">
            {{ tx.transaction_type === "payment" ? "+" : "-" }} {{ formatAmount(tx.amount) }} Ksh
          </p>

          <p class="date">
            {{
              new Date(tx.date).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </p>
        </div>
      </div>
    </section>

    <!-- Add Transaction Button -->
    <button class="fab" @click="showAddTransaction = true">
      <span class="material-symbols-outlined">add</span>
    </button>

    <!-- Add Modal -->
    <div v-if="showAddTransaction" class="modal-backdrop" @click="closeAddModal">
      <div class="modal-content" @click.stop>
        <h3>Add Transaction</h3>

        <!-- CUSTOMER -->
        <div class="input-group">
          <label>Customer</label>
          <div class="custom-select-wrapper">
            <button class="custom-select-display" @click="showCustomerDropdown = !showCustomerDropdown">
              <span>{{ selectedCustomerName || "Select customer" }}</span>
              <span class="material-symbols-outlined dropdown-icon">expand_more</span>
            </button>

            <div v-if="showCustomerDropdown" class="custom-select-dropdown">
              <div
                v-for="c in customerStore.customers"
                :key="c.id"
                class="custom-select-option"
                @click="selectCustomer(c.id)"
              >
                {{ c.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- TYPE -->
        <div class="input-group">
          <label>Transaction Type</label>
          <div class="custom-select-wrapper">
            <button class="custom-select-display" @click="showTypeDropdown = !showTypeDropdown">
              <span>{{ transaction.type ? (transaction.type === "payment" ? "Payment" : "Debt") : "Select type" }}</span>
              <span class="material-symbols-outlined dropdown-icon">expand_more</span>
            </button>

            <div v-if="showTypeDropdown" class="custom-select-dropdown">
              <div class="custom-select-option" @click="setType('payment')">Payment</div>
              <div class="custom-select-option" @click="setType('debt')">Debt</div>
            </div>
          </div>
        </div>

        <!-- AMOUNT / DESCRIPTION -->
        <div v-if="transaction.type === 'payment'" class="input-group">
          <label>Amount (Ksh)</label>
          <input type="number" v-model.number="transaction.amount" placeholder="e.g. 500" />
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
          <button @click="closeAddModal" class="btn cancel">Cancel</button>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import TopNav from "@/components/TopNav.vue";
import BottomNav from "@/components/BottomNav.vue";
import { useTransactionStore } from "@/stores/transactions";
import { useCustomerStore } from "@/stores/customers";
import { db } from "@/db";

const router = useRouter();
const transactionStore = useTransactionStore();
const customerStore = useCustomerStore();

const transactions = ref([]);
const searchQuery = ref("");
const showAddTransaction = ref(false);

const showCustomerDropdown = ref(false);
const showTypeDropdown = ref(false);

const transaction = ref({ customerId: "", type: "", amount: null, description: "" });

/* ---------- Helper ---------- */
function formatAmount(value) {
  const num = Number(value ?? (value === 0 ? 0 : NaN));
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

/* ---------- Computeds ---------- */
const selectedCustomerName = computed(() => {
  const c = customerStore.customers.find(c => c.id === transaction.value.customerId);
  return c ? c.name : "";
});

const mappedTransactions = computed(() => {
  return transactions.value.map(t => ({
    ...t,
    amount: Number(t.total_amount ?? t.amount ?? 0),
    customer_name:
      customerStore.customers.find(c => c.id === (t.customer_id ?? t.customerId))?.name ||
      "Unknown",
  }));
});

const filteredTransactions = computed(() => {
  const q = (searchQuery.value || "").toLowerCase();
  return mappedTransactions.value.filter(tx =>
    tx.customer_name.toLowerCase().includes(q) ||
    (tx.description && tx.description.toLowerCase().includes(q))
  );
});

/* ---------- Navigation ---------- */
function goToCustomer(id) {
  if (!id) return alert("Customer not found");
  router.push(`/customer/${id}`);
}

/* ---------- Loaders ---------- */
async function loadCustomers() {
  await customerStore.loadCustomers(); // ONLY offline
}

async function loadTransactions() {
  transactions.value = await db.transactions.orderBy('date').reverse().toArray();
}

/* ---------- Actions ---------- */
function selectCustomer(id) {
  transaction.value.customerId = id;
  showCustomerDropdown.value = false;
}

function setType(t) {
  transaction.value.type = t;
  showTypeDropdown.value = false;
}

function closeAddModal() {
  showAddTransaction.value = false;
  transaction.value = { customerId: "", type: "", amount: null, description: "" };
}

async function submitTransaction() {
  if (!transaction.value.customerId || !transaction.value.type) return alert("Fill all fields.");

  if (transaction.value.type === "payment") {
    await transactionStore.addPayment(transaction.value.customerId, Number(transaction.value.amount || 0));
  } else {
    const itemList = [{
      id: Date.now(),
      name: transaction.value.description || "Manual entry",
      quantity: 1,
      price: Number(transaction.value.amount || 0)
    }];
    await transactionStore.addDebt(transaction.value.customerId, itemList);
  }

  await loadTransactions();
  await loadCustomers();
  closeAddModal();
}

/* ---------- Lifecycle ---------- */
const closeDropdowns = (e) => {
  if (!e.target.closest('.custom-select-wrapper')) {
    showCustomerDropdown.value = false;
    showTypeDropdown.value = false;
  }
};

onMounted(async () => {
  await loadCustomers();
  await loadTransactions();
  document.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
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
.search-section { padding: 0 0.3rem; }
.search-bar { display: flex; align-items: center; background: white; border: 1px solid #e2e8f0; border-radius: 0.8rem; padding: 0.4rem 0.6rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); }
.search-icon { color: #6b7280; font-size: 1.4rem; margin-right: 0.3rem; }
.search-bar input { flex: 1; border: none; outline: none; font-size: 0.9rem; font-weight: bold; background: transparent; }

/* Transactions List */
.transactions-section { flex: 1; padding: 0.5rem 0.3rem 5rem; }
.transaction-card { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    background: white; 
    border-radius: 0.9rem; 
    padding: 0.5rem 0.5rem; 
    margin-bottom: 0.4rem; 
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
 }
.tx-info { display: flex; align-items: center; gap: 0.8rem; flex: 1; }
.icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; height: 2.5rem; width: 2.5rem; }
.icon.in { background: rgba(16, 124, 65, 0.1); color: #107c41; }
.icon.out { background: rgba(217, 76, 76, 0.1); color: #d94c4c; }
.tx-details .name { font-weight: 600; font-size: 0.95rem; }
.tx-details .desc { font-size: 0.8rem; color: #6b7280; }
.tx-meta { text-align: right; }
.tx-meta .amount { font-weight: 600; font-size: 0.9rem; }
.tx-meta .amount.in { color: #107c41; }
.tx-meta .amount.out { color: #d94c4c; }
.tx-meta .date { font-size: 0.7rem; color: #6b7280; }
.empty-text { text-align: center; font-size: 0.9rem; color: #94a3b8; padding-top: 1rem; }

/* Floating Button */
.fab { position: fixed; bottom: 4.5rem; right: 1.5rem; width: 3.5rem; height: 3.5rem; background: #005a9c; color: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15); cursor: pointer; transition: transform 0.15s ease; }
.fab:hover { transform: scale(1.05); }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); z-index: 1000; }
.modal-content { background: white; border-radius: 1.25rem; width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); padding: 1.5rem; }
.modal-content h3 { margin: 0 0 1.5rem; text-align: center; font-size: 1.3rem; font-weight: 700; color: #1e293b; }
.input-group { margin-bottom: 1.5rem; }
.input-group label { display: block; margin-bottom: 0.5rem; color: #475569; font-weight: 500; }
.input-group small { color: #64748b; font-weight: normal; }
.input-group input { width: 100%; padding: 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 0.75rem; font-size: 1.1rem; box-sizing: border-box; }
.modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
.btn { flex: 1; padding: 0.9rem; border: none; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn.primary { background: #059669; color: white; }
.btn.cancel { background: #e2e8f0; color: #475569; }

/* === CUSTOM DROPDOWN STYLES (identical to customers.vue) === */
.custom-select-wrapper { position: relative; }

.custom-select-display {
  width: 100%;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.9rem;
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
  width: 100%;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  z-index: 100;
  overflow: hidden;
  animation: dropdownIn 0.12s ease;
}

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-select-option {
  padding: 0.75rem 0.9rem;
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