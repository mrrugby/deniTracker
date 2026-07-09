<script setup>
import { computed, reactive, watch } from 'vue';
import BaseModal from '../BaseModal.vue';
import { formatCurrency, safeNumber, toInputDateTime } from '../../local';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  customers: {
    type: Array,
    default: () => []
  },
  activeItems: {
    type: Array,
    default: () => []
  },
  preselectedCustomerId: {
    type: Number,
    default: null
  },
  defaultMode: {
    type: String,
    default: 'debt'
  }
});

const emit = defineEmits(['close', 'save']);

function createBlankLine() {
  return {
    item_id: '',
    quantity: 1
  };
}

const form = reactive({
  customer_id: '',
  transaction_type: 'debt',
  debt_mode: 'manual',
  amount: '',
  description: '',
  date: toInputDateTime(),
  items: [createBlankLine()]
});

const itemOptions = computed(() => Array.isArray(props.activeItems) ? props.activeItems : []);

const lineItems = computed(() => form.items.map((entry, index) => {
  const item = itemOptions.value.find((option) => option.id === Number(entry.item_id));
  const quantity = Math.max(1, Math.round(safeNumber(entry.quantity) || 1));
  const price = safeNumber(item?.price);
  return {
    key: `${index}-${entry.item_id}-${quantity}`,
    item_id: Number(entry.item_id) || 0,
    name: item?.name || '',
    price,
    quantity,
    total: price * quantity
  };
}).filter((entry) => entry.item_id && entry.name));

const itemModeTotal = computed(() => lineItems.value.reduce((sum, entry) => sum + entry.total, 0));

function resetForm() {
  form.customer_id = props.preselectedCustomerId ?? '';
  form.transaction_type = props.defaultMode === 'payment' ? 'payment' : 'debt';
  form.debt_mode = 'manual';
  form.amount = '';
  form.description = '';
  form.date = toInputDateTime();
  form.items = [createBlankLine()];
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm();
  }
});

watch(() => props.defaultMode, (nextMode) => {
  if (props.open) {
    form.transaction_type = nextMode === 'payment' ? 'payment' : 'debt';
  }
});

watch(() => props.preselectedCustomerId, (customerId) => {
  if (props.open && customerId) {
    form.customer_id = customerId;
  }
});

function addItemLine() {
  form.items.push(createBlankLine());
}

function removeItemLine(index) {
  form.items.splice(index, 1);
  if (!form.items.length) {
    form.items.push(createBlankLine());
  }
}

function handleSubmit() {
  emit('save', {
    customer_id: Number(form.customer_id),
    transaction_type: form.transaction_type,
    amount: form.transaction_type === 'debt' && form.debt_mode === 'items' ? itemModeTotal.value : form.amount,
    description: form.description,
    date: form.date,
    items: form.transaction_type === 'debt' && form.debt_mode === 'items' ? lineItems.value : []
  });
}
</script>

<template>
  <BaseModal
    :open="open"
    title="Add transaction"
    description="Record a new debt or payment. Saved entries cannot be edited later."
    @close="$emit('close')"
  >
    <form class="form-grid" @submit.prevent="handleSubmit">
      <label class="field">
        <span>Customer</span>
        <select v-model="form.customer_id">
          <option disabled value="">Select customer</option>
          <option v-for="customer in customers" :key="customer.id" :value="customer.id">
            {{ customer.name }}
          </option>
        </select>
      </label>

      <div class="segmented">
        <button
          type="button"
          class="segment"
          :class="{ active: form.transaction_type === 'debt' }"
          @click="form.transaction_type = 'debt'"
        >
          Debt
        </button>
        <button
          type="button"
          class="segment"
          :class="{ active: form.transaction_type === 'payment' }"
          @click="form.transaction_type = 'payment'"
        >
          Payment
        </button>
      </div>

      <template v-if="form.transaction_type === 'debt'">
        <div class="segmented subtle">
          <button
            type="button"
            class="segment"
            :class="{ active: form.debt_mode === 'manual' }"
            @click="form.debt_mode = 'manual'"
          >
            Manual amount
          </button>
          <button
            type="button"
            class="segment"
            :class="{ active: form.debt_mode === 'items' }"
            @click="form.debt_mode = 'items'"
          >
            Choose Item
          </button>
        </div>

        <label v-if="form.debt_mode === 'manual'" class="field">
          <span>Amount</span>
          <input
            v-model="form.amount"
            type="number"
            inputmode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </label>

        <div v-else class="item-builder">
          <div class="item-builder__header">
            <div>
              <h3>Selected items</h3>
              <p>Add one or more products.</p>
            </div>
            <button type="button" class="ghost-button" @click="addItemLine">Add Item</button>
          </div>

          <div v-if="!itemOptions.length" class="empty-note">
            Add stock items first before using item-based debt.
          </div>

          <div v-for="(entry, index) in form.items" :key="index" class="item-line">
            <label class="field">
              <span>Item</span>
              <select v-model="entry.item_id">
                <option disabled value="">Select item</option>
                <option v-for="item in itemOptions" :key="item.id" :value="item.id">
                  {{ item.name }} - {{ formatCurrency(item.price) }}
                </option>
              </select>
            </label>

            <label class="field small-field">
              <span>Qty</span>
              <input v-model="entry.quantity" type="number" min="1" step="1" inputmode="numeric" />
            </label>

            <button type="button" class="icon-button remove-line" @click="removeItemLine(index)">x</button>
          </div>

          <div class="total-banner">
            <span>Calculated total</span>
            <strong>{{ formatCurrency(itemModeTotal) }}</strong>
          </div>
        </div>
      </template>

      <label v-else class="field">
        <span>Amount</span>
        <input
          v-model="form.amount"
          type="number"
          inputmode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
        />
      </label>

      <label class="field">
        <span>Description</span>
        <textarea v-model.trim="form.description" rows="3" placeholder="Optional note" />
      </label>

      <label class="field">
        <span>Date</span>
        <input v-model="form.date" type="datetime-local" />
      </label>

      <div class="modal-actions">
        <button type="button" class="ghost-button" @click="$emit('close')">Cancel</button>
        <button type="submit" class="primary-button">Save</button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.segmented {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.subtle {
  margin-top: -0.1rem;
}

.segment {
  min-height: 3rem;
  border-radius: 1rem;
  border: 1px solid rgba(23, 68, 59, 0.1);
  background: rgba(244, 239, 229, 0.7);
  font: inherit;
  font-weight: 700;
}

.segment.active {
  background: var(--brand);
  color: white;
}

.item-builder {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 1.2rem;
  background: rgba(244, 239, 229, 0.78);
}

.item-builder__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.item-builder__header h3,
.item-builder__header p {
  margin: 0;
}

.item-builder__header p {
  color: var(--muted);
  font-size: 0.88rem;
}

.item-line {
  display: grid;
  grid-template-columns: 1fr 5.5rem 2.5rem;
  gap: 0.75rem;
  align-items: end;
}

.small-field input {
  text-align: center;
}

.remove-line {
  margin-bottom: 0.2rem;
}

.total-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.9);
}

.empty-note {
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.76);
  color: var(--muted);
  font-size: 0.9rem;
}
</style>
