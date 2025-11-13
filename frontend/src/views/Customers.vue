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
                ? outstanding(customer).toFixed(2) + " Ksh due"
                : "Paid up" }}
            </p>

            <p class="small">
              Last payment:
              {{
                customer.last_payment_date
                  ? new Date(customer.last_payment_date).toLocaleString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
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

    <!-- Add Customer Modal -->
    <div v-if="showAddModal" class="modal" @keydown.esc="showAddModal = false">
      <div class="modal-content" role="dialog" aria-modal="true" aria-label="Add new customer">
        <h3>Add New Customer</h3>

        <input v-model="newCustomer.name" type="text" placeholder="Name" />
        <input v-model="newCustomer.phone" type="text" placeholder="Phone" />

        <div class="modal-actions">
          <button @click="saveCustomer">Save</button>
          <button class="cancel" @click="showAddModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Floating Add Button -->
    <div class="fab">
      <button @click="showAddModal = true" aria-label="Add customer">+</button>
    </div>
  </div>

  <!-- Bottom Navigation -->
  <BottomNav />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import TopNav from "@/components/TopNav.vue";
import BottomNav from "@/components/BottomNav.vue";

const customers = ref([]);
const showAddModal = ref(false);
const search = ref("");
const sortOption = ref("debt-desc");
const router = useRouter();
const newCustomer = ref({ name: "", phone: "" });
const API_BASE = import.meta.env.VITE_API_BASE;

const page = ref(1);
const pageSize = 6; // reduced to 6 per page

// --- Custom sort dropdown state
const showSort = ref(false);
const sortWrapper = ref(null);
const sortOptions = [
  { value: "debt-desc", label: "Debt: High to Low" },
  { value: "debt-asc", label: "Debt: Low to High" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const currentSortLabel = computed(() => {
  const found = sortOptions.find((o) => o.value === sortOption.value || o.value === sortOption);
  return found ? found.label : "Sort by";
});

function toggleSort() {
  showSort.value = !showSort.value;
}

function selectSort(value) {
  sortOption.value = value;
  showSort.value = false;
}

// close sort dropdown when clicking outside
function onDocClick(e) {
  const el = sortWrapper.value;
  if (!el) return;
  if (!el.contains(e.target)) {
    showSort.value = false;
  }
}

onMounted(() => {
  window.addEventListener("click", onDocClick);
  loadCustomers();
});

onBeforeUnmount(() => {
  window.removeEventListener("click", onDocClick);
});

// --- Data loading / saving (logic preserved)
async function loadCustomers() {
  try {
    const res = await fetch(`${API_BASE}/customers/`);
    const data = await res.json();
    customers.value = data;
  } catch (error) {
    console.error("Error loading customers:", error);
  }
}

async function saveCustomer() {
  if (!newCustomer.value.name) return alert("Name required");

  await fetch(`${API_BASE}/customers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newCustomer.value),
  });

  showAddModal.value = false;
  newCustomer.value = { name: "", phone: "" };
  await loadCustomers();
}

function outstanding(c) {
  // keep existing behavior (guard for number types)
  return (parseFloat(c.total_debt || 0) - parseFloat(c.total_payments || 0)) || 0;
}

// --- Filtering / sorting / pagination (kept behavior)
const filteredCustomers = computed(() => {
  let list = customers.value.filter((c) =>
    c.name.toLowerCase().includes(search.value.toLowerCase())
  );

  if (sortOption.value === "debt-desc")
    list.sort((a, b) => outstanding(b) - outstanding(a));

  if (sortOption.value === "debt-asc")
    list.sort((a, b) => outstanding(a) - outstanding(b));

  if (sortOption.value === "name-asc")
    list.sort((a, b) => a.name.localeCompare(b.name));

  if (sortOption.value === "name-desc")
    list.sort((a, b) => b.name.localeCompare(a.name));

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
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=1763cf&color=fff`;
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

/* CONTROLS (mobile-first stacked) */
.controls {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  
}

/* SEARCH */
.search-wrapper {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.45rem 0.6rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  min-width: 0;
}

.search-wrapper:focus-within {
  border-color: #1763cf;
  box-shadow: 0 0 0 2px rgba(23,99,207,0.12);
}

.search-icon {
  color: #1e293b;
  font-size: 1.1rem;
  margin-right: 0.2rem;
}

.search-wrapper input {
  border: none;
  outline: none;
  font-size: 0.9rem;
  font-weight: 500;
  background: transparent;
  color: #1e293b;
}

.search-wrapper input::placeholder {
  color: #1e293b;
  font-weight: bold;
}

/* SORT (custom dropdown) */
.sort-wrapper {
  position: relative;
  width: 58%;
}

.sort-display {
  width: 100%;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: grey;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  cursor: pointer;
}

.sort-display:focus {
  outline: none;
  border-color: grey;
  box-shadow: 0 0 0 2px rgba(23,99,207,0.12);
}

.dropdown-icon {
  font-size: 1.2rem;
  color: #64748b;
  transition: transform 0.15s ease;
}

/* dropdown panel */
.sort-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: #ffffff;
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
  padding: 0.55rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: #1e293b;
  transition: background 0.12s;
}

.sort-option:hover {
  background: #f1f5f9;
}

.sort-option.active {
  background: #e8f0fe;
  color: #1763cf;
  font-weight: 700;
}

/* CUSTOMER LIST  */
.customers {
  margin-top: 0.1rem;
}

.customer-list {
  list-style: none;
  margin: 0 0.5rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.customer-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.6rem 0.75rem;
  margin: 0.4rem 0;
  width: 100%;
  max-width: 720px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.12s ease;
  cursor: pointer;
}

.customer-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(23,99,207,0.08);
}

.avatar img {
  width: 2rem; 
  height: 2rem;
  border-radius: 9999px;
  object-fit: cover;
}

.info {
  flex: 1;
  margin-left: 0.5rem;
}

.info h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.amount {
  font-size: 0.7rem;
  margin-top: 0.18rem;
  font-weight: 500;
}

.red { color: #dc2626; }
.green { color: #16a34a; }

.small {
  color: #64748b;
  font-size: 0.7rem;
}

/* PAGINATION */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0 5rem;
}

.pagination button {
  background: #1763cf;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.42rem 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.pagination button:hover:not(:disabled) {
  background: #1453b3;
}

.pagination button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

/* MODAL */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(17,24,33,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 80;
  padding: 0.1rem;
}

.modal-content {
  background: #ffffff;
  width: 90%;
  max-width: 400px;
  border-radius: 0.9rem;
  padding: 1.2rem 1.4rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.modal-content h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.8rem;
}

.modal-content input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 0.6rem;
  padding: 0.55rem;
  font-size: 0.95rem;
  margin-bottom: 0.7rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal-actions button {
  border: none;
  border-radius: 0.5rem;
  padding: 0.45rem 1rem;
  font-weight: 500;
  cursor: pointer;
}

.modal-actions button:not(.cancel) {
  background: #1763cf;
  color: white;
}

.modal-actions .cancel {
  background: #e2e8f0;
  color: #1e293b;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 6rem;
  right: 1.5rem;
  z-index: 70;
}
.fab button {
  width: 2.2rem;
  height: 2.5rem;
  border-radius: 500px;
  background: #1763cf;
  color: white;
  border: none;
  font-size: 1.6rem;
  box-shadow: 0 4px 12px rgba(23,99,207,0.3);
  cursor: pointer;
}

/* Responsive: side-by-side on larger screens */
@media (min-width: 640px) {
  .controls {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .sort-wrapper {
    width: 36%;
  }
  .search-wrapper {
    width: calc(64% - 0.6rem);
  }
}
</style>
