<template>
  <TopNav />

  <div class="profile">
    <!-- Header -->
    <header>
      <button class="back-btn" @click="$router.push('/')">
        <svg viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1>{{ customer.name || 'Customer' }}</h1>
    </header>

    <!-- Balance Summary -->
    <section class="summary">
      <div class="balance highlight">
        <span>Customer Balance</span>

        <strong :class="{ debt: balance > 0, paid: balance <= 0 }">
          {{ Math.abs(balance).toLocaleString() }} Ksh
        </strong>

        <small v-if="balance > 0">Customer owes you</small>
        <small v-else-if="balance < 0">You owe customer</small>
        <small v-else>Settled</small>
      </div>
    </section>

    <!-- Action Buttons -->
    <section class="actions">
      <button @click="showDebtModal = true" class="btn primary">
        <svg viewBox="0 0 24 24"><path d="M12 5v14m7-7H5"/></svg>
        Add Deni
      </button>
      <button @click="showPaymentModal = true" class="btn secondary">
        <svg viewBox="0 0 24 24"><path d="M12 5v14m7-7H5"/></svg>
        Add Payment
      </button>
    </section>

    <!-- Transactions -->
    <section class="transactions">
      <h3>Recent Transactions</h3>

      <div
        v-if="transactions.length"
        v-for="t in transactions"
        :key="t.id"
        class="transaction-card"
        @click="openTransactionDetails(t)"
      >
        <div class="icon" :class="t.transaction_type">
          <svg viewBox="0 0 24 24">
            <path v-if="t.transaction_type==='debt'" d="M19 13H5v-2h14v2z"/>
            <path v-else d="M12 5v14m7-7H5"/>
          </svg>
        </div>

        <div class="details">
          <div class="title">
            {{ t.transaction_type === 'debt' ? 'Credit Sale' : 'Payment Received' }}
          </div>

          <div class="amount" :class="t.transaction_type">
            {{ t.transaction_type === 'debt' ? '+' : '-' }}
            {{ Number(t.amount || 0).toLocaleString(undefined,{minimumFractionDigits:2}) }} Ksh
          </div>

          <div class="description">
            {{ t.description || "No description" }}
          </div>
        </div>

        <div class="meta">
          <span class="status" :class="t.transaction_type">
            {{ t.transaction_type === 'debt' ? 'Unpaid' : 'Paid' }}
          </span>

          <div class="date">
            {{ new Date(t.date).toLocaleString("en-KE",{
              day:"numeric",
              month:"short",
              hour:"2-digit",
              minute:"2-digit"
            }) }}
          </div>
        </div>
      </div>

      <div v-else class="no-transactions">No transactions yet.</div>
    </section>

    <!-- Transaction Detail Modal -->
    <div
      v-if="showTransactionDetailModal"
      class="modal-backdrop"
      @click="showTransactionDetailModal = false"
    >
      <div class="modal" @click.stop>

        <h3>Transaction Details</h3>

        <div v-if="selectedTransaction">

          <p>
            <strong>Type:</strong>
            {{ selectedTransaction.transaction_type === 'debt'
              ? 'Credit Sale'
              : 'Payment'
            }}
          </p>

          <p>
            <strong>Amount:</strong>

            {{
              selectedTransaction.transaction_type === 'debt'
                ? Number(
                    selectedTransaction.items?.reduce(
                      (sum,item)=>
                        sum +
                        (Number(item.unit_price||0) *
                        Number(item.quantity||0)),
                      0
                    ) || 0
                  ).toLocaleString(undefined,{minimumFractionDigits:2})
                : Number(selectedTransaction.amount||0)
                  .toLocaleString(undefined,{minimumFractionDigits:2})
            }}
            Ksh
          </p>

          <p v-if="selectedTransaction.description">
            <strong>Description:</strong>
            {{ selectedTransaction.description }}
          </p>

          <div v-if="selectedTransaction.items && selectedTransaction.items.length">
            <h4>Items</h4>

            <ul>
              <li
                v-for="item in selectedTransaction.items"
                :key="item.id"
              >
                {{ item.name }} —
                {{ Number(item.quantity || 0) }} ×
                {{ Number(item.unit_price || 0).toLocaleString(undefined,{
                  minimumFractionDigits:2
                }) }} Ksh
              </li>
            </ul>
          </div>

          <p style="margin-top:1rem;font-size:0.85rem;color:#6b7280;">
            Date:
            {{ new Date(selectedTransaction.date).toLocaleString("en-KE") }}
          </p>

          <div class="modal-actions" style="margin-top:1.2rem">
            <button
              class="btn cancel"
              @click="showTransactionDetailModal=false"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>

    <!-- Payment + Debt Modals -->
    <div
      v-if="showPaymentModal || showDebtModal"
      class="modal-backdrop"
      @click="closeModals"
    >
      <div class="modal" @click.stop>

        <!-- Payment Modal -->
        <div v-if="showPaymentModal">
          <h3>Record Payment</h3>

          <input
            v-model.number="paymentAmount"
            type="number"
            placeholder="Enter amount"
            autofocus
          />

          <div class="modal-actions">
            <button
              @click="submitPayment"
              class="btn primary"
            >
              Save
            </button>

            <button
              @click="showPaymentModal = false"
              class="btn cancel"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Debt Modal -->
        <div v-if="showDebtModal">

          <h3>Add Deni</h3>

          <div class="item-list">
            <label
              v-for="item in items"
              :key="item.id"
              class="item-row"
            >
              <input
                type="checkbox"
                v-model="item.selected"
              />

              <span class="item-name">
                {{ item.name }}
              </span>

              <span class="item-price">
                {{ parseFloat(item.price || 0).toFixed(2) }} Ksh
              </span>

              <input
                v-if="item.selected"
                v-model.number="item.quantity"
                type="number"
                min="1"
                class="qty"
                placeholder="Qty"
              />
            </label>
          </div>

          <div class="total">
            Total:
            <strong>
              {{ computedTotal.toFixed(2) }} Ksh
            </strong>
          </div>

          <div class="modal-actions">
            <button
              @click="submitDebt"
              class="btn primary"
              :disabled="computedTotal === 0"
            >
              Save
            </button>

            <button
              @click="showDebtModal = false"
              class="btn cancel"
            >
              Cancel
            </button>
          </div>

        </div>

      </div>
    </div>
  </div>

  <!-- Toast -->
  <div v-if="toast.show" class="toast">
    {{ toast.message }}
  </div>

  <BottomNav />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import {
  fetchCustomer,
  fetchItems,
  addTransaction,
  calculateCustomerBalance
} from "@/services/local";

import TopNav from "@/components/TopNav.vue";
import BottomNav from "@/components/BottomNav.vue";

const route = useRoute();

const customer = ref({
  id:0,
  name:"",
  total_debt:0,
  total_payments:0,
  transactions:[]
});

const transactions = computed(()=>customer.value.transactions || []);

const items = ref([]);

const showPaymentModal = ref(false);
const showDebtModal = ref(false);

const paymentAmount = ref(0);

const balance = ref(0);

const showTransactionDetailModal = ref(false);
const selectedTransaction = ref(null);

const toast = ref({
  show:false,
  message:""
});

function showToast(message){
  toast.value.message = message;
  toast.value.show = true;

  setTimeout(()=>{
    toast.value.show = false;
  },1000);
}

function openTransactionDetails(tx){
  selectedTransaction.value = tx;
  showTransactionDetailModal.value = true;
}

async function loadCustomer(){
  const customerId = Number(route.params.id);

  const data = await fetchCustomer(customerId);

  customer.value = data || { transactions:[] };

  balance.value = await calculateCustomerBalance(customerId);
}

async function loadItems(){
  const fetchedItems = await fetchItems();

  items.value = fetchedItems.map(i=>({
    ...i,
    selected:false,
    quantity:1
  }));
}

async function submitPayment(){

  if(!paymentAmount.value){
    showToast("Enter payment amount");
    return;
  }

  await addTransaction(
    customer.value.id,
    "payment",
    { amount: paymentAmount.value }
  );

  paymentAmount.value = 0;

  showPaymentModal.value = false;

  showToast("Payment recorded");

  await loadCustomer();
}

async function submitDebt(){

  const selected = items.value
    .filter(i=>i.selected && i.quantity>0)
    .map(i=>({
      id:i.id,
      name:i.name,
      quantity:Number(i.quantity),
      unit_price:Number(i.price || 0)
    }));

  if(!selected.length){
    showToast("Select at least one item");
    return;
  }

  const totalAmount = selected.reduce(
    (sum,item)=>sum + item.quantity * item.unit_price,
    0
  );

  await addTransaction(
    customer.value.id,
    "debt",
    {
      amount:totalAmount,
      items:selected
    }
  );

  showDebtModal.value = false;

  showToast("Debt recorded");

  await loadCustomer();
}

const computedTotal = computed(()=>
  items.value
    .filter(i=>i.selected)
    .reduce(
      (sum,i)=>sum + parseFloat(i.price || 0) * i.quantity,
      0
    )
);

function closeModals(){
  showPaymentModal.value=false;
  showDebtModal.value=false;
}

onMounted(async()=>{
  await loadCustomer();
  await loadItems();
});
</script>

<style scoped>
.profile{
  padding:1rem;
  min-height:100vh;
  background:#f9fafb;
  font-family:system-ui,-apple-system,sans-serif;
}

header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:1.5rem;
  position:relative;
}

header h1{
  position:absolute;
  left:50%;
  transform:translateX(-50%);
  font-size:1.25rem;
  font-weight:700;
  color:#1f2937;
}

.back-btn{
  background:none;
  border:none;
  padding:0.5rem;
  cursor:pointer;
}

.back-btn svg{
  width:24px;
  height:24px;
  fill:#6b7280;
}

.summary{
  background:white;
  border-radius:1rem;
  padding:1.25rem;
  box-shadow:0 1px 3px rgba(0,0,0,0.1);
  margin-bottom:1.5rem;
}

.balance{
  display:flex;
  justify-content:space-between;
  padding:0.75rem 0;
  font-size:0.95rem;
}

.balance.highlight{
  padding-top:1rem;
  border-top:1px dashed #e5e7eb;
  font-size:1.1rem;
  font-weight:600;
}

.balance span{color:#6b7280;}

.debt{color:#dc2626;}
.paid{color:#16a34a;}

.actions{
  display:flex;
  gap:1rem;
  margin-bottom:2rem;
}

.btn{
  flex:1;
  padding:1rem;
  border:none;
  border-radius:1rem;
  font-weight:600;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:0.5rem;
  box-shadow:0 4px 12px rgba(0,0,0,0.15);
}

.btn svg{
  width:20px;
  height:20px;
}

.btn.primary{background:#dc2626;}
.btn.secondary{background:#16a34a;}

.transactions h3{
  margin:1.5rem 0 1rem;
  font-size:1.1rem;
  color:#374151;
  font-weight:600;
}

.transaction-card{
  display:flex;
  align-items:center;
  gap:1rem;
  background:white;
  padding:1rem;
  border-radius:1rem;
  box-shadow:0 1px 3px rgba(0,0,0,0.1);
  margin-bottom:0.75rem;
}

.icon{
  width:48px;
  height:48px;
  border-radius:12px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}

.icon.debt{background:#fee2e2;color:#dc2626;}
.icon.payment{background:#dcfce7;color:#16a34a;}

.icon svg{
  width:24px;
  height:24px;
  fill:currentColor;
}

.details{flex:1;}

.title{
  font-weight:600;
  color:#1f2937;
}

.amount{
  font-weight:700;
  font-size:1.1rem;
  margin:0.25rem 0;
}

.amount.debt{color:#dc2626;}
.amount.payment{color:#16a34a;}

.description{
  color:#6b7280;
  font-size:0.875rem;
}

.meta{text-align:right;}

.status{
  display:block;
  padding:0.35rem 0.75rem;
  border-radius:999px;
  font-size:0.75rem;
  font-weight:600;
  margin-bottom:0.5rem;
}

.status.debt{
  background:#fee2e2;
  color:#dc2626;
}

.status.payment{
  background:#dcfce7;
  color:#16a34a;
}

.date{
  font-size:0.8rem;
  color:#9ca3af;
}

.modal-backdrop{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.5);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:1rem;
  z-index:1000;
  backdrop-filter:blur(4px);
}

.modal{
  background:white;
  border-radius:1.25rem;
  width:100%;
  max-width:420px;
  max-height:85vh;
  display:flex;
  flex-direction:column;
  padding:1.5rem;
  overflow-y:auto;
  box-shadow:0 20px 40px rgba(0,0,0,0.15);
}

.modal h3{
  margin:0 0 1.5rem;
  text-align:center;
  font-size:1.3rem;
  font-weight:700;
}

.modal input[type="number"]{
  box-sizing:border-box;
  width:100%;
  padding:1rem;
  border:1.5px solid #e5e7eb;
  border-radius:0.75rem;
  font-size:1.1rem;
  text-align:center;
  margin-bottom:1rem;
}

.item-list{
  max-height:40vh;
  overflow-y:auto;
  margin:1rem 0;
}

.item-row{
  display:flex;
  align-items:center;
  gap:0.75rem;
  padding:0.75rem 0;
  border-bottom:1px solid #f3f4f6;
}

.item-row input[type="checkbox"]{
  width:20px;
  height:20px;
}

.item-name{flex:1;font-weight:500;}

.item-price{color:#6b7280;}

.qty{
  width:70px;
  padding:0.5rem;
  text-align:center;
  border:1px solid #d1d5db;
  border-radius:0.5rem;
}

.total{
  text-align:right;
  font-size:1.25rem;
  font-weight:700;
  color:#dc2626;
  margin:1.5rem 0;
}

.modal-actions{
  display:flex;
  gap:1rem;
}

.modal-actions .cancel{
  background:#e5e7eb;
  color:#374151;
}

.toast{
  position:fixed;
  bottom:90px;
  left:50%;
  transform:translateX(-50%);
  background:#111827;
  color:white;
  padding:0.75rem 1.2rem;
  border-radius:999px;
  font-size:0.9rem;
  box-shadow:0 8px 20px rgba(0,0,0,0.25);
  z-index:2000;
}
</style>