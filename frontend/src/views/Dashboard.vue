<template>
  <div class="dashboard">


    <div class="content">

      <!-- Stats Cards -->
      <div class="stats-cards">
        <div class="card">
          <p class="card-title">Total Debt</p>
          <p class="card-value">{{ totalDebt.toFixed(2) }} Ksh</p>
          <p class="card-subtext">Total across all customers</p>
        </div>
        <div class="card">
          <p class="card-title">Total Payments</p>
          <p class="card-value">{{ totalPayments.toFixed(2) }} Ksh</p>
          <p class="card-subtext">Total received</p>
        </div>
      </div>

      <!-- Customer List -->
      <section class="customers">
        <div class="customers-header">
          <h2>Customers</h2>
          <button class="add-btn" @click="addCustomer">+ Add Customer</button>
        </div>

        <ul>
          <li
            v-for="customer in customers"
            :key="customer.id"
            @click="goToCustomer(customer.id)"
            class="customer-card"
          >
            <h3>{{ customer.name }}</h3>
            <p>Balance: {{ customer.total_debt.toFixed(2) }} Ksh</p>
          </li>
        </ul>
      </section>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchCustomers } from "@/services/api";
import TopNavbar from "@/components/TopNavbar.vue";
import NavBar from "@/components/Navbar.vue"

const router = useRouter();
const customers = ref([]);
const totalDebt = ref(0);
const totalPayments = ref(0);

async function loadData() {
  try {
    const data = await fetchCustomers();
    customers.value = data;

    totalDebt.value = data.reduce((sum, c) => sum + (c.total_debt || 0), 0);
    totalPayments.value = data.reduce((sum, c) => sum + (c.total_payments || 0), 0);
  } catch (err) {
    console.error("Error fetching customers:", err);
  }
}

function goToCustomer(id) {
  router.push(`/customer/${id}`);
}

function addCustomer() {
  alert("This will open the Add Customer form (coming soon)");
}

onMounted(loadData);
</script>

<style scoped>
/* General Layout */
.dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
  background-color: #f6f7f8;
  color: #111821;
}

/* Main Content */
.content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Stats Cards */
.stats-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.card {
  flex: 1;
  min-width: 160px;
  background: #fff;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.card-title { font-weight: 600; color: #6b7280; font-size: 0.9rem; }
.card-value { font-weight: bold; font-size: 1.5rem; }
.card-subtext { font-size: 0.8rem; color: #9ca3af; }

/* Customers Section */
.customers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.add-btn {
  background-color: #1763cf;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
}
.customer-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.8rem;
  padding: 0.8rem;
  margin-bottom: 0.8rem;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.customer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}
.customer-card h3 { margin: 0; font-size: 1.2rem; }
.customer-card p { margin: 0.2rem 0 0; color: #555; font-size: 0.9rem; }

/* Responsive */
@media (max-width: 600px) {
  .stats-cards { flex-direction: column; }
  .card { font-size: 0.95rem; }
  .add-btn { font-size: 0.85rem; padding: 0.4rem 0.8rem; }
}
</style>
