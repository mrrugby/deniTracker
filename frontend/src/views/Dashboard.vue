<template>
  <div class="dashboard">
    <!-- Top Navigation -->
    <TopNav />

    <!-- Summary Cards -->
    <section class="cards polished">
      <div class="summary-card">
        <p class="label">Debt Added</p>
        <p class="value red">{{ totalDebt.toLocaleString() }} Ksh</p>
      </div>
      <div class="summary-card">
        <p class="label">Paid Today</p>
        <p class="value green">{{ totalPayments.toLocaleString() }} Ksh</p>
      </div>
      <div class="summary-card small">
        <p class="value small-num">{{ transactions.length }}</p>
        <p class="label small-label">Owe You</p>
      </div>
    </section>

    <!-- Quick Actions – Clean 2 + 1 layout -->
    <!-- Quick Actions -->
  <section class="actions polished">
    <button class="action main" @click="showAddTransaction = true">
      <span class="material-symbols-outlined">add_circle</span>
      <span>Add Transaction</span>
    </button>

    <button class="action secondary" @click="showAddCustomer = true">
      <span class="material-symbols-outlined">person_add</span>
      <span>Add Customer</span>
    </button>

    <!-- Tiny expand button (centered below) -->
    <button class="expand-btn" @click="toggleActions = !toggleActions">
      <span class="material-symbols-outlined">
        {{ toggleActions ? 'expand_less' : 'expand_more' }}
      </span>
    </button>

    <!-- Dropdown appears below the tiny button -->
    <transition name="dropdown">
      <div v-if="toggleActions" class="dropdown-actions">
        <button class="dropdown-item" @click="showAddStock = true; toggleActions = false">
          <span class="material-symbols-outlined">add_shopping_cart</span>
          <span>Add Stock</span>
        </button>
        <!-- Add more items later -->
      </div>
    </transition>
  </section>

    <!-- Rest of your component (unchanged) -->
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

    <!-- Modals (unchanged) -->
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

    <!-- Add Transaction Modal (unchanged) -->
    <div v-if="showAddTransaction" class="modal-backdrop" @click="closeTransactionModal">
      <div class="modal-content" @click.stop>
        <h3>Add Transaction</h3>
        <!-- ... rest of modal unchanged ... -->
        <!-- (keeping it collapsed for brevity – it's identical) -->
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import TopNav from "@/components/TopNav.vue";
import BottomNav from "@/components/BottomNav.vue";
import { useCustomerStore } from "@/stores/customers";
import { useTransactionStore } from "@/stores/transactions";
import { useItemStore  } from "@/stores/items";


const router = useRouter();
const toggleActions = ref(false);

const customerStore = useCustomerStore();
const transactionStore = useTransactionStore();
const stockStore = useItemStore();

const customers = ref([]);
const transactions = ref([]);
const items = ref([]);

const totalDebt = ref(0);
const totalPayments = ref(0);

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

const computedTotal = computed(() =>
  items.value.filter(i => i.selected).reduce((sum, i) => sum + i.price * i.quantity, 0)
);

function selectCustomer(id, name) {
  transaction.value.customerId = id;
  showCustomerDropdown.value = false;
}

function closeTransactionModal() {
  showAddTransaction.value = false;
  showCustomerDropdown.value = false;
  showTypeDropdown.value = false;
}

function goToCustomer(id) {
  if (!id) return alert("Customer not found for this transaction.");
  router.push(`/customer/${id}`);
}

async function loadLocalCustomers() {
  try {
    await customerStore.loadCustomers();
    customers.value = customerStore.customers;
  } catch {
    customers.value = await customerStore.loadCustomers() || customerStore.customers;
  }
}

async function loadLocalTransactions() {
  await transactionStore.loadTransactions();
  transactions.value = transactionStore.transactions.map(t => ({
    id: t.id,
    customer_id: t.customer_id ?? t.customerId ?? t.customerId,
    customer_name: (customers.value.find(c => c.id === (t.customer_id ?? t.customerId)) || {}).name || "Unknown",
    transaction_type: t.transaction_type,
    amount: Number(t.total_amount ?? t.amount ?? 0),
    description: t.description ?? "",
    date: t.date ?? (t.created_at || new Date().toISOString())
  }));
  computeTotals();
}

function computeTotals() {
  totalDebt.value = transactions.value
    .filter(t => t.transaction_type === "debt")
    .reduce((s, t) => s + Number(t.amount), 0);

  totalPayments.value = transactions.value
    .filter(t => t.transaction_type === "payment")
    .reduce((s, t) => s + Number(t.amount), 0);
}

async function submitCustomer() {
  if (!newCustomer.value.name.trim()) return alert("Customer name is required.");
  await customerStore.addCustomer({ name: newCustomer.value.name.trim(), phone: newCustomer.value.phone || "" });
  newCustomer.value = { name: "", phone: "" };
  showAddCustomer.value = false;
  await loadLocalCustomers();
  await loadLocalTransactions();
}

async function submitTransaction() {
  if (!transaction.value.customerId || !transaction.value.type)
    return alert("Please fill all fields.");

  if (transaction.value.type === "payment") {
    await transactionStore.addPayment(transaction.value.customerId, transaction.value.amount);
  } else {
    const selectedItems = items.value.filter(i => i.selected && i.quantity > 0);
    if (!selectedItems.length) return alert("Select at least one item.");
    await transactionStore.addDebt(transaction.value.customerId, selectedItems.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    })));
    items.value.forEach(i => { i.selected = false; i.quantity = 1; });
  }

  closeTransactionModal();
  transaction.value = { customerId: "", type: "", amount: null, description: "" };

  await loadLocalTransactions();
  await loadLocalCustomers();
}

function handleDocClick(e) {
  if (!e.target.closest(".custom-select-wrapper")) {
    showCustomerDropdown.value = false;
    showTypeDropdown.value = false;
  }
}

async function loadItems() {
  await stockStore.loadItems(); // <-- fetch user-added items
  items.value = stockStore.items.map(i => ({
    id: i.id,
    name: i.name,
    price: Number(i.price),
    selected: false,
    quantity: 1,
  }));
}

onMounted(async () => {
  document.addEventListener("click", handleDocClick);
  await loadLocalCustomers();
  await loadLocalTransactions();
  await loadItems();
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocClick);
});
</script>

<style scoped>
/* Core Layout */
.dashboard {
  font-family: "Inter", sans-serif;
  background: #f8fafc;
  color: #0f172a;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 3rem;
}

/* Summary Cards - Polished 3-column */
.cards.polished {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 0.3rem;
}

.summary-card {
  background: white;
  border-radius: 1.1rem;
  text-align: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  transition: transform 0.15s ease;
}

.summary-card:hover {
  transform: scale(0.98);
}

.summary-card .label {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.2rem;
  font-weight: 500;
}

.summary-card .value {
  font-size: 1.45rem;
  font-weight: 700;
}

.value.red { color: #ef4444; }
.value.green { color: #10b981; }
.small-num { font-size: 1.4rem; }
.small-label { font-size: 0.75rem; }

/* Quick Actions - Now a clean grid with integrated More button */
.actions.polished {
  padding: 0.2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
  align-items: start;
  position: relative;
}

/* Main Action Buttons - Taller & More Tappable */
.action.main,
.action.secondary {
  height: 68px;
  border-radius: 1.1rem;
  font-size: 1.05rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transaform 0.2s ease;
}

.action:active {
  transform: scale(0.97);
}

.action.main {
  background: #059669;
  color: white;
}

.action.secondary {
  background: black;
  color: white;
}
/* Tiny centered expand button */
.expand-btn {
  grid-column: 1 / -1;
  justify-self: center;
  width: 40px;
  height: 40px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  font-size: 1.4rem;
  color: #475569;
}

.expand-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.expand-btn:active {
  transform: scale(0.92);
  background: #f1f5f9;
}


.action.more-toggle:active {
  background: #334155;
}

/* Dropdown appears below the tiny button */
.dropdown-actions {
  grid-column: 1 / -1;
  margin-top: 0.75rem;
  background: black;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
  animation: dropdownIn 0.22s ease-out;
}

.dropdown-item {
  width: 100%;
  padding: 1.1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 500;
  font-size: 1rem;
  background: none;
  border: none;
  text-align: left;
  transition: background 0.15s;
}

.dropdown-item:hover { background: #f8fafc; }
.dropdown-item:active { background: #f1f5f9; }


/* Transactions List */
.transactions-section {
  padding: 0 0.1rem;
}

.transactions-section h2 {
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 800;
}

.transactions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.transaction {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.transaction:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.4rem;
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
  padding: 2.5rem 0;
  font-size: 0.95rem;
}

/* Modals & Inputs (unchanged but cleaned) */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
  backdrop-filter: blur(6px);
}

.modal-content {
  background: white;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
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
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
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

.btn.primary { background: #059669; color: white; }
.btn.cancel { background: #e2e8f0; color: #475569; }

/* Custom Select Dropdowns */
.custom-select-wrapper {
  position: relative;
}

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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
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
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
  animation: dropdownIn 0.15s ease-out;
}

.custom-select-option {
  padding: 0.8rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: background 0.12s;
}

.custom-select-option:hover {
  background: #f1f5f9;
}

.custom-select-option.active {
  background: #e8f0fe;
  color: #1763cf;
  font-weight: 700;
}

/* Item List in Debt Modal */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-top: 0.5rem;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 0;
}

.item-name {
  flex: 1;
  font-weight: 500;
}

.item-price {
  margin-left: auto;
  font-weight: 600;
  color: #059669;
}

.qty {
  width: 70px;
  padding: 0.4rem 0.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 1rem;
}

/* Animations */
@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.22s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

</style>
