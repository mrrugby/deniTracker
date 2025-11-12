<template>
     <!-- Top Navigation -->
    <TopNav />
  <div class="customers-page">
    <!-- Header -->
    <header class="topbar">
      <h1>Customers</h1>
    </header>

    <!-- Search + Sort -->
    <div class="controls">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Search customers..."
        />
      </div>

      <select v-model="sortOption" class="sort-menu">
        <option value="debt-desc">Debt: High → Low</option>
        <option value="debt-asc">Debt: Low → High</option>
        <option value="name-asc">Name: A → Z</option>
        <option value="name-desc">Name: Z → A</option>
      </select>
    </div>

    <!-- Customers List -->
    <section class="customers">
      <ul>
        <li
          v-for="customer in paginatedCustomers"
          :key="customer.id"
          class="customer-card"
          @click="goToCustomer(customer.id)"
        >
          <!-- Avatar -->
          <div class="avatar">
            <img :src="avatar(customer.name)" />
          </div>

          <!-- Details -->
          <div class="info">
            <h3>{{ customer.name }}</h3>

            <p
              :class="{
                red: outstanding(customer) > 0,
                green: outstanding(customer) <= 0
              }"
              class="amount"
            >
              {{ outstanding(customer) > 0
                ? outstanding(customer).toFixed(2) + ' Ksh due'
                : 'Paid up' }}
            </p>

            <p class="small">
              Last payment: {{
                customer.last_payment_date
                  ? new Date(customer.last_payment_date).toLocaleDateString()
                  : 'No payments yet'
              }}
            </p>
          </div>

          <!-- Arrow -->
          <span class="chevron">›</span>
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
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <h3>Add New Customer</h3>

        <input v-model="newCustomer.name" type="text" placeholder="Name" />
        <input v-model="newCustomer.phone" type="text" placeholder="Phone" />

        <div class="modal-actions">
          <button @click="saveCustomer">Save</button>
          <button class="cancel" @click="showAddModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <div class="fab">
      <button @click="showAddModal = true">+</button>
    </div>

    

  </div>
   <!-- Bottom Navigation -->
    <BottomNav />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
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
const pageSize = 8;

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
  return c.total_debt - c.total_payments;
}

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

onMounted(loadCustomers);
</script>

<style scoped>
/* PAGE WRAPPER */
.customers-page {
  padding: 1rem;
  font-family: Inter, system-ui;
  background: #f6f7f8;
  min-height: 100vh;
}

/* HEADER */
.topbar {
  margin-bottom: 1rem;
}
.topbar h1 {
  font-size: 1.8rem;
  font-weight: 700;
}

/* SEARCH + SORT */
.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.search-wrapper {
  display: flex;
  align-items: center;
  background: white;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 0.7rem;
  padding-left: 0.6rem;
}
.search-icon {
  font-size: 1.2rem;
  opacity: 0.6;
}
.search-wrapper input {
  flex: 1;
  padding: 0.6rem;
  border: none;
  outline: none;
  font-size: 1rem;
}
.sort-menu {
  padding: 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
}

/* CUSTOMER LIST */
.customer-card {
  display: flex;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 0.8rem;
  border: 1px solid #ddd;
  margin-bottom: 0.7rem;
  cursor: pointer;
  transition: 0.25s;
}
.customer-card:hover {
  background: #eef4ff;
}

/* AVATAR */
.avatar img {
  width: 52px;
  height: 52px;
  border-radius: 50%;
}

/* DETAILS */
.info {
  flex: 1;
  margin-left: 0.8rem;
}
.info h3 {
  font-size: 1.1rem;
  font-weight: 600;
}
.amount {
  margin-top: 0.25rem;
  font-size: 0.95rem;
}
.red {
  color: #d82330;
}
.green {
  color: #00a86b;
}
.small {
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: 2px;
}

/* ARROW */
.chevron {
  font-size: 2rem;
  opacity: 0.4;
  margin-left: 0.5rem;
}

/* PAGINATION */
.pagination {
  margin: 1.4rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.pagination button {
  padding: 0.5rem 1rem;
  background: #1763cf;
  color: white;
  border: none;
  border-radius: 0.5rem;
}
.pagination button:disabled {
  background: #9ca3af;
}

/* MODAL */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  width: 90%;
  padding: 1rem;
  border-radius: 0.75rem;
}
.modal-content input {
  width: 100%;
  padding: 0.6rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.modal-actions button {
  padding: 0.5rem 1rem;
  background: #1763cf;
  color: white;
  border: none;
  border-radius: 0.5rem;
}
.cancel {
  background: #9ca3af;
}

/* FAB */
.fab button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #1763cf;
  color: white;
  font-size: 2rem;
}
</style>
