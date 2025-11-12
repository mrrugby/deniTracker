<template>
     <!-- Top Navigation -->
    <TopNav />
  <div class="profile">
    <header>
      <button class="back" @click="$router.push('/')">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back
      </button>
      <h2>{{ customer?.name || 'Customer' }}</h2>
      <button class="settings">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>
    </header>

    <section class="customer-details" v-if="customer">
      <p><strong>Total Debt:</strong> {{ parseFloat(customer.total_debt || 0).toFixed(2) }} Ksh</p>
      <p><strong>Total Payments:</strong> {{ parseFloat(customer.total_payments || 0).toFixed(2) }} Ksh</p>
      <p><strong>Outstanding:</strong> {{ (parseFloat(customer.total_debt || 0) - parseFloat(customer.total_payments || 0)).toFixed(2) }} Ksh</p>
    </section>

    <section class="actions">
      <button @click="showDebtModal = true">
        <svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14m7-7H5"/></svg>
        Add Deni
      </button>
      <button @click="showPaymentModal = true" class="secondary">
        <svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14m7-7H5"/></svg>
        Add Payment
      </button>
    </section>

<section class="transactions" v-if="transactions.length">
  <h3>Transactions</h3>
  <ul>
    <li v-for="t in transactions" :key="t.id" class="transaction-card">
      <div class="transaction-icon">
        <svg class="icon">
          <path v-if="t.transaction_type==='debt'" d="M19 13H5v-2h14v2z"/>
          <path v-else d="M12 5v14m7-7H5"/>
        </svg>
      </div>
      <div class="transaction-info">
        <p class="transaction-title">{{ t.transaction_type==='debt' ? 'Debt' : 'Payment' }} — {{ parseFloat(t.total_amount || 0).toFixed(2) }} Ksh</p>
        <p class="transaction-subtitle">{{ t.description || '' }}</p>
      </div>
      <div class="transaction-status">
        <span :class="t.transaction_type==='debt' ? 'unpaid' : 'paid'">
          {{ t.transaction_type==='debt' ? 'Unpaid' : 'Paid' }}
        </span>
        <p class="transaction-date">{{ new Date(t.date).toLocaleDateString() }}</p>
      </div>
    </li>
  </ul>
</section>


    <!-- Modals -->
    <div v-if="showPaymentModal || showDebtModal" class="modal">
      <div class="modal-content">
        <h3 v-if="showPaymentModal">Record Payment</h3>
        <input v-if="showPaymentModal" v-model.number="paymentAmount" type="number" placeholder="Amount Paid" />
        <h3 v-if="showDebtModal">Add Deni (Credit Sale)</h3>
        <div v-if="showDebtModal" class="item-list">
          <div v-for="item in items" :key="item.id" class="item-row">
            <label><input type="checkbox" v-model="item.selected"/> {{ item.name }} ({{ parseFloat(item.price || 0).toFixed(2) }})</label>
            <input v-if="item.selected" v-model.number="item.quantity" type="number" min="1" class="qty"/>
          </div>
        </div>
        <div v-if="showDebtModal" class="total">Total: {{ computedTotal.toFixed(2) }}</div>
        <div class="modal-actions">
          <button @click="showPaymentModal ? submitPayment() : submitDebt()">Save</button>
          <button class="cancel" @click="showPaymentModal=false;showDebtModal=false;">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Floating Add Transaction Button -->
    <div class="fab">
      <button @click="showDebtModal=true">
        <svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14m7-7H5"/></svg>
      </button>
    </div>
  </div>
   <!-- Bottom Navigation -->
    <BottomNav />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { fetchItems, addTransaction } from "@/services/api";
import TopNav from "@/components/TopNav.vue";
import BottomNav from "@/components/BottomNav.vue";

const route = useRoute();
const customer = ref({ id:0, name:'', total_debt:0, total_payments:0, transactions:[] });
const transactions = ref([]);
const items = ref([]);
const showPaymentModal = ref(false);
const showDebtModal = ref(false);
const paymentAmount = ref(0);
const API_BASE = import.meta.env.VITE_API_BASE;

async function loadCustomer() {
  const res = await fetch(`${API_BASE}/customers/${route.params.id}/`);
  const json = await res.json();
  customer.value = { ...json };
  transactions.value = (json.transactions || []).map(t=>({...t,total_amount:parseFloat(t.total_amount||0)}));
}

async function loadItems() {
  const fetchedItems = await fetchItems();
  items.value = fetchedItems.map(i=>({...i,selected:false,quantity:1}));
}

async function submitPayment() {
  await addTransaction(customer.value.id,'payment',{amount:paymentAmount.value});
  paymentAmount.value=0; showPaymentModal.value=false; await loadCustomer();
}

async function submitDebt() {
  const selected = items.value.filter(i=>i.selected&&i.quantity>0);
  if(!selected.length){alert('Select at least one item'); return;}
  await addTransaction(customer.value.id,'debt',{items:selected.map(i=>({item:i.id,quantity:i.quantity}))});
  showDebtModal.value=false; await loadCustomer();
}

const computedTotal = computed(()=>items.value.filter(i=>i.selected).reduce((sum,i)=>sum+(parseFloat(i.price||0)*i.quantity),0));

onMounted(()=>{loadCustomer(); loadItems();});
</script>

<style scoped>
.profile { padding:1rem; font-family: system-ui, sans-serif; position:relative; }

.transactions ul {
  list-style: none;
  padding: 0;
}

.transaction-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  margin-bottom: 0.75rem;
}

.transaction-icon {
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.transaction-icon .icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.transaction-info {
  flex: 1;
}

.transaction-title {
  font-weight: 500;
  font-size: 1rem;
}

.transaction-subtitle {
  font-size: 0.875rem;
  color: #6b7280; /* text-secondary */
}

.transaction-status {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.transaction-status span {
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  display: inline-block;
}

.transaction-status .unpaid {
  background-color: rgba(211, 47, 47, 0.1);
  color: #D32F2F;
}

.transaction-status .paid {
  background-color: rgba(30, 96, 67, 0.1);
  color: #1E6043;
}

.transaction-date {
  font-size: 0.75rem;
  color: #6b7280;
}
 

header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
.back,.settings { background:transparent;border:none;display:flex;align-items:center;gap:0.3rem; cursor:pointer; }
.customer-details { background:#f3f4f6; border-radius:1rem; padding:1rem; margin-bottom:1rem; }
.actions { display:flex; gap:0.5rem; margin-bottom:1rem; }
.actions button { flex:1; display:flex; align-items:center; gap:0.3rem; padding:0.5rem; border:none; border-radius:0.5rem; background:#1763cf; color:white; cursor:pointer; }
.actions button.secondary { background:#6b7280; }
.transactions ul { list-style:none; padding:0; }
.transaction-item { display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem; }
.icon-wrapper { width:36px;height:36px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;border-radius:0.5rem; }
.transaction-details .date{font-size:0.75rem;color:#6b7280;}
.icon{width:24px;height:24px;fill:currentColor;}
.modal { position:fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center;}
.modal-content { background:white; padding:1rem; border-radius:0.5rem; width:90%; max-width:400px;}
.item-list{max-height:300px;overflow-y:auto;margin-bottom:0.5rem;}
.item-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;}
.qty{width:60px;}
.total{font-weight:bold;text-align:right;margin-bottom:0.5rem;}
.modal-actions{display:flex;justify-content:flex-end;gap:0.5rem;}
.modal-actions button{padding:0.5rem 1rem;border:none;border-radius:0.4rem;cursor:pointer;background:#1763cf;color:white;}
.modal-actions button.cancel{background:#9ca3af;}
.fab{position:fixed;bottom:16px;right:16px;}
.fab button{width:56px;height:56px;border-radius:50%;background:#1E6043;color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;}
</style>
