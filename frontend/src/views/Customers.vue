<template>
  <!-- Top Navigation -->
  <TopNav />

  <div class="customers-page">
    <!-- Search + Sort -->
    <div class="controls">
      <!-- Search -->
      <div class="search-wrapper">
        <span class="material-symbols-outlined search-icon">search</span>
        <input v-model="search" type="text" placeholder="Search customers..." />
      </div>

      <!-- Custom Sort Dropdown -->
      <div ref="sortWrapper" class="sort-wrapper">
        <button
          class="sort-display"
          @click="toggleSort"
          :aria-expanded="showSort.toString()"
          aria-haspopup="listbox"
        >
          <span>{{ currentSortLabel }}</span>
          <span class="material-symbols-outlined dropdown-icon">expand_more</span>
        </button>

        <div v-if="showSort" class="sort-dropdown" role="listbox">
          <div
            v-for="option in sortOptions"
            :key="option.value"
            role="option"
            :aria-selected="option.value === sortOption"
            class="sort-option"
            :class="{ active: sortOption === option.value }"
            @click="selectSort(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Customers List -->
    <section class="customers">
      <ul class="customer-list">
        <li
          v-for="customer in paginatedCustomers"
          :key="customer.id"
          class="customer-card"
          @click="goToCustomer(customer.id)"
        >
          <!-- Avatar -->
          <div class="avatar">
            <img :src="avatar(customer.name)" alt="Avatar" />
          </div>

          <!-- Details -->
          <div class="info">
            <h3>{{ customer.name }}</h3>
            <p :class="{ red: outstanding(customer) > 0, green: outstanding(customer) <= 0 }" class="amount">
              {{ outstanding(customer) > 0
                ? outstanding(customer).toLocaleString() + " Ksh due"
                : "Paid up" }}
            </p>

            <p class="small">
              Last payment:
              {{
                customer.last_payment_date
                  ? new Date(customer.last_payment_date).toLocaleString('en-KE', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : "No payments yet"
              }}
            </p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Pagination -->
    <div class="pagination">
      <button :disabled="page === 1" @click="page--">Prev</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page === totalPages" @click="page++">Next</button>
    </div>

    <!-- Add Customer Modal – NOW MATCHES DASHBOARD.VUE -->
    <div v-if="showAddModal" class="modal-backdrop" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <h3>Add New Customer</h3>

        <div class="input-group">
          <label>Customer Name</label>
          <input v-model="newCustomer.name" type="text" placeholder="Enter name" autofocus />
        </div>

        <div class="input-group">
          <label>Phone Number <small>(optional)</small></label>
          <input v-model="newCustomer.phone" type="text" placeholder="e.g. 0712345678" />
        </div>

        <div class="modal-actions">
          <button @click="saveCustomer" class="btn primary">Save</button>
          <button @click="showAddModal = false" class="btn cancel">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Floating Add Button -->
    <button class="fab" @click="showAddModal = true" aria-label="Add Customer">
      <span class="material-symbols-outlined">add</span>
    </button>
  </div>

  <!-- Bottom Navigation -->
  <BottomNav />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import TopNav from "@/components/TopNav.vue";
import BottomNav from "@/components/BottomNav.vue";
import { useCustomerStore } from "@/stores/customers";

const router = useRouter();
const customerStore = useCustomerStore();

const customers = computed(() => customerStore.customers);
const showAddModal = ref(false);
const search = ref("");
const sortOption = ref("debt-desc");

const page = ref(1);
const pageSize = 6;

const newCustomer = ref({ name: "", phone: "" });

// Dropdown logic stays the same
const showSort = ref(false);
const sortWrapper = ref(null);

const sortOptions = [
  { value: "debt-desc", label: "Debt: High to Low" },
  { value: "debt-asc", label: "Debt: Low to High" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const currentSortLabel = computed(() => {
  const found = sortOptions.find(o => o.value === sortOption.value);
  return found?.label ?? "Sort";
});

function toggleSort() {
  showSort.value = !showSort.value;
}
function selectSort(v) {
  sortOption.value = v;
  showSort.value = false;
}

function onDocClick(e) {
  if (!sortWrapper.value?.contains(e.target)) showSort.value = false;
}

onMounted(async () => {
  window.addEventListener("click", onDocClick);

  // load customers from store (auto offline/online behavior)
  await customerStore.loadCustomers();
});

onBeforeUnmount(() => {
  window.removeEventListener("click", onDocClick);
});

// LOCAL ONLY save
async function saveCustomer() {
  if (!newCustomer.value.name.trim()) return alert("Customer name is required");
  
  await customerStore.addCustomer({
    name: newCustomer.value.name.trim(),
    phone: newCustomer.value.phone || "",
    total_debt: 0,
    total_payments: 0,
    last_payment_date: null
  });

  newCustomer.value = { name: "", phone: "" };
  showAddModal.value = false;
}

// UI Calculations
function outstanding(c) {
  return (Number(c.total_debt || 0) - Number(c.total_payments || 0)) || 0;
}

const filteredCustomers = computed(() => {
  let list = customers.value.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase())
  );

  if (sortOption.value === "debt-desc") list.sort((a, b) => outstanding(b) - outstanding(a));
  if (sortOption.value === "debt-asc") list.sort((a, b) => outstanding(a) - outstanding(b));
  if (sortOption.value === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
  if (sortOption.value === "name-desc") list.sort((a, b) => b.name.localeCompare(a.name));

  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCustomers.value.length / pageSize))
);

const paginatedCustomers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredCustomers.value.slice(start, start + pageSize);
});

function avatar(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1763cf&color=fff`;
}

function goToCustomer(id) {
  router.push(`/customer/${id}`);
}
</script>


<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined");

/* Page base */
.customers-page {
  font-family: "Inter", system-ui, sans-serif;
  background-color: #f6f7f8;
  min-height: 100vh;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
}

/* CONTROLS */
.controls {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

/* SEARCH */
.search-wrapper {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.7rem 0.9rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.search-wrapper:focus-within {
  border-color: #1763cf;
  box-shadow: 0 0 0 3px rgba(23,99,207,0.12);
}

.search-icon {
  color: #64748b;
  font-size: 1.3rem;
  margin-right: 0.5rem;
}

.search-wrapper input {
  border: none;
  outline: none;
  font-size: 1rem;
  font-weight: 500;
  background: transparent;
  color: #1e293b;
  flex: 1;
}

.search-wrapper input::placeholder {
  color: #94a3b8;
}

/* SORT DROPDOWN */
.sort-wrapper {
  position: relative;
}

.sort-display {
  width: 100%;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.sort-display[aria-expanded="true"] .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-icon {
  font-size: 1.4rem;
  color: #64748b;
  transition: transform 0.15s ease;
}

.sort-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  z-index: 60;
  overflow: hidden;
  animation: dropdownIn 0.12s ease;
}

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.sort-option {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: background 0.12s;
}

.sort-option:hover { background: #f1f5f9; }
.sort-option.active {
  background: #e8f0fe;
  color: #1763cf;
  font-weight: 700;
}

/* CUSTOMER LIST */
.customer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.customer-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.15s ease;
  cursor: pointer;
}

.customer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23,99,207,0.1);
}

.avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.info {
  flex: 1;
  margin-left: 1rem;
}

.info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem;
}

.amount {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0.25rem 0;
}

.red { color: #dc2626; }
.green { color: #16a34a; }

.small {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
}

/* PAGINATION */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0 6rem;
  font-weight: 600;
}

.pagination button {
  background: #1763cf;
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #1453b3;
}

.pagination button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

/* MODAL – EXACT SAME AS DASHBOARD.VUE */
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

/* FAB */
.fab {
  position: fixed;
  bottom: 5rem;
  right: 1.5rem;
  width: 56px;
  height: 56px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(5,150,105,0.4);
  cursor: pointer;
  z-index: 90;
  transition: transform 0.2s;
}

.fab:hover {
  transform: scale(1.1);
}

/* Responsive */
@media (min-width: 640px) {
  .controls {
    flex-direction: row;
    align-items: center;
  }
  .search-wrapper {
    width: 65%;
  }
  .sort-wrapper {
    width: 34%;
  }
}
</style>