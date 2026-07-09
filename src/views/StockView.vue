<script setup>
import { computed, ref } from 'vue';
import EmptyState from '../components/EmptyState.vue';
import ItemModal from '../components/modals/ItemModal.vue';
import ConfirmModal from '../components/modals/ConfirmModal.vue';
import SearchInput from '../components/SearchInput.vue';
import { useLedger } from '../composables/useLedger';
import { useModalState } from '../composables/useModalState';
import { useToast } from '../composables/useToast';
import { formatCurrency } from '../local';

const ledger = useLedger();
const toast = useToast();
const itemModal = useModalState(false);
const confirmModal = useModalState(false);
const currentItem = ref(null);
const query = ref('');

const filteredItems = computed(() => {
  const term = query.value.trim().toLowerCase();

  if (!term) {
    return ledger.items.value;
  }

  return ledger.items.value.filter((item) => item.name.toLowerCase().includes(term));
});

function openAddItem() {
  currentItem.value = null;
  itemModal.open();
}

function openEditItem(item) {
  currentItem.value = item;
  itemModal.open();
}

function askDeleteItem(item) {
  currentItem.value = item;
  confirmModal.open();
}

async function handleSaveItem(payload) {
  try {
    await ledger.saveItem(payload);
    toast.success(payload.id ? 'Item updated successfully' : 'Item added successfully');
    itemModal.close();
  } catch (error) {
    toast.error(error.message || 'Could not save item');
  }
}

async function handleToggle(item) {
  try {
    await ledger.toggleItemAvailability(item.id, !item.is_active);
    toast.success(item.is_active ? 'Item marked unavailable' : 'Item made available');
  } catch (error) {
    toast.error(error.message || 'Could not update item');
  }
}

async function handleDelete() {
  try {
    if (currentItem.value?.id) {
      await ledger.deleteItem(currentItem.value.id);
      toast.success('Item deleted successfully');
    }
  } catch (error) {
    toast.error(error.message || 'Could not delete item');
  } finally {
    confirmModal.close();
  }
}
</script>

<template>
  <div class="page-stack">
    <section class="section-card">
      <div class="section-head">
        <div>
          <p class="section-kicker">Stock</p>
          <h2>Manage item pricing</h2>
        </div>
        <button type="button" class="primary-button" @click="openAddItem">Add item</button>
      </div>

      <SearchInput v-model="query" placeholder="Search stock items" />
    </section>

    <section v-if="filteredItems.length" class="list-stack">
      <article v-for="item in filteredItems" :key="item.id" class="stock-card">
        <div>
          <h3>{{ item.name }}</h3>
          <p>{{ formatCurrency(item.price) }}</p>
        </div>

        <div class="stock-actions">
          <button type="button" class="ghost-button compact" @click="handleToggle(item)">
            {{ item.is_active ? 'Disable' : 'Enable' }}
          </button>
          <button type="button" class="ghost-button compact" @click="openEditItem(item)">Edit</button>
          <button type="button" class="danger-link" @click="askDeleteItem(item)">Delete</button>
        </div>
      </article>
    </section>

    <EmptyState
      v-else
      title="No stock items yet"
      description="Stock items make debt entry faster by calculating totals from quantity and price."
    >
      <button type="button" class="primary-button" @click="openAddItem">Add item</button>
    </EmptyState>

    <ItemModal
      :open="itemModal.isOpen.value"
      :item="currentItem"
      @close="itemModal.close()"
      @save="handleSaveItem"
    />

    <ConfirmModal
      :open="confirmModal.isOpen.value"
      title="Delete item"
      :description="`Delete ${currentItem?.name || 'this item'} from stock? Past transaction records will stay intact.`"
      confirm-label="Delete item"
      @close="confirmModal.close()"
      @confirm="handleDelete"
    />
  </div>
</template>

<style scoped>
.stock-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.84);
}

.stock-card h3,
.stock-card p {
  margin: 0;
}

.stock-card p {
  margin-top: 0.3rem;
  color: var(--muted);
}

.stock-actions {
  display: grid;
  justify-items: end;
  gap: 0.45rem;
}
</style>
