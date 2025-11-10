<template>
  <!-- ✅ Prevent null errors while data loads -->
  <div v-if="customer" class="profile">

    <button @click="goBack" class="back-btn">← Back</button>

    <h1>{{ customer.name }}</h1>
    <p class="phone">{{ customer.phone }}</p>

    <div class="summary-card">
      <p><strong>Total Debt:</strong> {{ customer.total_debt }} Ksh</p>
      <p><strong>Total Payments:</strong> {{ customer.total_payments }} Ksh</p>
      <p><strong>Balance:</strong> {{ customer.balance }} Ksh</p>
    </div>

    <div class="actions">
      <button class="btn debt" @click="openDebtModal">+ Add Debt</button>
      <button class="btn payment" @click="openPaymentModal">Record Payment</button>
    </div>

    <h2>Transactions</h2>
    <ul class="transactions">
      <li v-for="t in customer.transactions" :key="t.id" class="transaction">

        <p class="date">{{ formatDate(t.date) }}</p>

        <!-- Debt transaction -->
        <p v-if="t.transaction_type === 'debt'" class="type debt-type">
          Debt ({{ sumItems(t.items) }} Ksh)
        </p>

        <ul v-if="t.items.length">
          <li v-for="item in t.items" :key="item.id">
            {{ item.item_name }} ({{ item.quantity }} × {{ item.unit_price }} = {{ item.subtotal }} Ksh)
          </li>
        </ul>

        <!-- Payment transaction -->
        <p v-if="t.transaction_type === 'payment'" class="type pay-type">
          Payment: {{ t.amount }} Ksh
        </p>
      </li>
    </ul>

    <!-- ✅ DEBT MODAL -->
    <div v-if="showDebt" class="modal">
      <div class="panel">
        <h3>Add Debt</h3>

        <label>Item name</label>
        <input v-model="itemName" placeholder="Milk, Bread, Sugar..." />

        <label>Price</label>
        <input v-model.number="itemPrice" type="number" />

        <label>Quantity</label>
        <input v-model.number="itemQty" type="number" min="1" />

        <button class="btn" @click="submitDebt">Add Debt</button>
        <button class="close" @click="closeModals">Cancel</button>
      </div>
    </div>

    <!-- ✅ PAYMENT MODAL -->
    <div v-if="showPayment" class="modal">
      <div class="panel">
        <h3>Record Payment</h3>

        <label>Amount</label>
        <input v-model.number="paymentAmount" type="number" min="1" />

        <button class="btn" @click="submitPayment">Record</button>
        <button class="close" @click="closeModals">Cancel</button>
      </div>
    </div>

  </div>

  <!-- ✅ Loading state -->
  <div v-else class="loading">
    Loading customer…
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchCustomer, addDebt, addPayment } from "@/services/api";

const route = useRoute();
const router = useRouter();

const customer = ref(null);

// Modal toggles
const showDebt = ref(false);
const showPayment = ref(false);

// Debt form fields
const itemName = ref("");
const itemPrice = ref(0);
const itemQty = ref(1);

// Payment field
const paymentAmount = ref(0);

function openDebtModal() { showDebt.value = true; }
function openPaymentModal() { showPayment.value = true; }
function closeModals() {
  showDebt.value = false;
  showPayment.value = false;
}

function sumItems(items) {
  return items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
}

function formatDate(d) {
  return new Date(d).toLocaleString();
}

async function loadCustomer() {
  const id = route.params.id;
  customer.value = await fetchCustomer(id);
}

// Add new debt
async function submitDebt() {
  await addDebt(customer.value.id, [
    {
      item_name: itemName.value,
      unit_price: itemPrice.value,
      quantity: itemQty.value,
      subtotal: itemPrice.value * itemQty.value,
    },
  ]);

  closeModals();
  await loadCustomer();
}

// Add payment
async function submitPayment() {
  await addPayment(customer.value.id, paymentAmount.value);

  closeModals();
  await loadCustomer();
}

function goBack() {
  router.push("/");
}

onMounted(loadCustomer);
</script>

<style scoped>
.profile {
  padding: 1rem;
}

.summary-card {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: .8rem;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn {
  padding: .6rem 1rem;
  border: none;
  border-radius: .5rem;
  background: #2563eb;
  color: white;
}

.debt-type { color: red; font-weight: bold; }
.pay-type { color: green; font-weight: bold; }

.transactions {
  list-style: none;
  padding: 0;
}

.transaction {
  background: white;
  padding: .8rem;
  border: 1px solid #ddd;
  border-radius: .6rem;
  margin-bottom: .6rem;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.panel {
  background: white;
  padding: 1rem;
  border-radius: .8rem;
  width: 260px;
}

.loading {
  padding: 2rem;
  text-align: center;
  font-size: 1.2rem;
}
</style>
