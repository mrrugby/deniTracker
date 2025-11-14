<template>
  <TopNav />

  <div class="page">
    <header class="header">
      <h2>Shop Stock</h2>
      <button class="add-btn" @click="openAddModal">+ Add Product</button>
    </header>

    <!-- Loading -->
    <div v-if="store.loading" class="loading">Loading items…</div>

    <!-- Error -->
    <div v-if="store.error" class="error">{{ store.error }}</div>

    <!-- Empty -->
    <div v-if="!store.loading && store.items.length === 0" class="empty">
      No stock items yet. Add your first item!
    </div>

    <!-- Item List -->
    <div class="item-list">
      <div
        v-for="item in store.items"
        :key="item.id"
        class="item-card"
      >
        <div>
          <h3>{{ item.name }}</h3>
          <p class="price">KSH {{ item.price }}</p>
          <p class="status" :class="{ inactive: !item.is_active }">
            {{ item.is_active ? "Active" : "Inactive" }}
          </p>
        </div>

        <div class="actions">
          <button @click="openEditModal(item)">Edit</button>
          <button class="delete-btn" @click="deleteItem(item.id)">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <teleport to="body">
      <div v-if="showModal" class="modal-bg" @click.self="closeModal">
        <div class="modal">
          <h3>{{ editingItem ? "Edit Item" : "Add New Item" }}</h3>

          <label>Name</label>
          <input v-model="form.name" required />

          <label>Price (KSH)</label>
          <input
            v-model="form.price"
            @input="formatPrice"
            type="text"
            inputmode="decimal"
            required
          />

          <label class="check-row">
            <input type="checkbox" v-model="form.is_active" />
            Active
          </label>

          <div class="modal-actions">
            <button @click="saveItem" :disabled="saving">
              {{ saving ? "Saving…" : "Save" }}
            </button>
            <button class="cancel" @click="closeModal">Cancel</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>

  <BottomNav />
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { useItemStore } from "@/stores/items"
import TopNav from "@/components/TopNav.vue"
import BottomNav from "@/components/BottomNav.vue"

const store = useItemStore()

const showModal = ref(false)
const editingItem = ref(null)
const saving = ref(false)

const form = reactive({
  name: "",
  price: "",
  is_active: true,
})

onMounted(() => {
  store.loadItems().catch(() => {
    // Silent – error is shown in UI
  })
})

/* ---------- Modal ---------- */
function openAddModal() {
  editingItem.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(item) {
  editingItem.value = item
  form.name = item.name
  form.price = String(item.price)
  form.is_active = item.is_active
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function resetForm() {
  form.name = ""
  form.price = ""
  form.is_active = true
}

/* ---------- Price Format ---------- */
function formatPrice() {
  let v = String(form.price).replace(/[^\d.]/g, "")
  const parts = v.split(".")
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("")
  if (parts[1]) parts[1] = parts[1].slice(0, 2)
  form.price = parts.join(".")
}

/* ---------- Save ---------- */
async function saveItem() {
  if (!form.name.trim()) {
    alert("Please enter a name")
    return
  }
  if (!form.price || isNaN(Number(form.price))) {
    alert("Please enter a valid price")
    return
  }

  const payload = {
    name: form.name.trim(),
    price: Number(form.price),
    is_active: form.is_active,
  }

  saving.value = true
  try {
    if (editingItem.value) {
      await store.updateItem(editingItem.value.id, payload)
      alert("Item updated successfully")
    } else {
      await store.addItem(payload)
      alert("Item added successfully")
    }
    closeModal()
  } catch (e) {
    alert("Error: " + e.message)
  } finally {
    saving.value = false
  }
}

/* ---------- Delete ---------- */
async function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this item?")) return

  try {
    await store.deleteItem(id)
    alert("Item deleted")
  } catch (e) {
    alert("Failed to delete: " + e.message)
  }
}
</script>

<style scoped>
/* Page layout (so top & bottom nav don't overlap content) */
.page {
  padding: 80px 20px 90px; /* space for TopNav + BottomNav */
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.add-btn {
  background: #2563eb;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
}

/* LIST */
.item-list {
  margin-top: 10px;
}

.item-card {
  padding: 14px;
  border: 1px solid #e4e4e4;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: 0.15s;
}

.item-card:active {
  transform: scale(0.98);
}

.price {
  font-weight: bold;
  color: #111;
}

.actions button {
  margin-left: 8px;
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
}

.delete-btn {
  background: #dc2626;
  color: white;
}

/* Active / inactive label */
.status {
  font-size: 12px;
  margin-top: 4px;
  color: green;
}
.status.inactive {
  color: #888;
}

/* MODAL BACKGROUND */
.modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(2px);
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.15s ease-out;
}

/* MODAL BOX */
.modal {
  background: white;
  padding: 22px;
  width: 85%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  animation: popIn 0.2s ease-out;
}

/* INPUT */
.modal input[type="text"],
.modal input[type="number"] {
  width: 100%;
  margin: 6px 0 12px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 16px;
}

.check-row {
  display: flex;
  align-items: center;
  margin-top: 6px;
  gap: 6px;
}

/* MODAL BUTTONS */
.modal-actions {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}

.modal-actions button {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  font-size: 15px;
}

.cancel {
  background: #999;
  color: white;
}

/* ANIMATIONS */
@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}

@keyframes popIn {
  from { transform: scale(0.95); opacity: 0 }
  to { transform: scale(1); opacity: 1 }
}

/* EMPTY STATE */
.empty {
  margin-top: 20px;
  text-align: center;
  color: #666;
}
</style>
