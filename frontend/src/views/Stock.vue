<template>
  <TopNav />

  <div class="page">
    <header class="header">
      <h2>Shop Stock</h2>
      <button class="add-btn" @click="openAddModal">
        + Add Product
      </button>
    </header>

    <!-- Loading / Error / Empty -->
    <div v-if="store.loading" class="empty-state">Loading items…</div>
    <div v-if="store.error" class="empty-state error">{{ store.error }}</div>
    <div v-if="!store.loading && !store.error && store.items.length === 0" class="empty-state">
      No stock items yet.<br>Add your first product!
    </div>

    <!-- Item List -->
    <div class="item-list">
      <div
        v-for="item in store.items"
        :key="item.id"
        class="item-card"
      >
        <div class="item-info">
          <h3>{{ formatName(item.name) }}</h3>
          <p class="price">{{ Number(item.price).toLocaleString() }} Ksh</p>
          <span class="status" :class="{ inactive: !item.is_active }">
            {{ item.is_active ? 'In Stock' : 'Out of Stock' }}
          </span>
        </div>

        <div class="actions">
          <button @click="openEditModal(item)" class="edit-btn">Edit</button>
          <button @click="deleteItem(item.id)" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>

    <!--  -->
    <teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-content">
          <h3>{{ editingItem ? "Edit Product" : "Add New Product" }}</h3>

          <div class="input-group">
            <label>Product Name</label>
            <input v-model="form.name" type="text" placeholder="e.g. Unga 2kg" required />
          </div>

          <div class="input-group">
            <label>Price (Ksh)</label>
            <input
              v-model="form.price"
              @input="formatPrice"
              type="text"
              inputmode="decimal"
              placeholder="e.g. 185"
              required
            />
          </div>

          <div class="input-group checkbox">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_active" />
              <span class="checkmark"></span>
              In Stock?
            </label>
          </div>

          <div class="modal-actions">
            <button @click="saveItem" class="btn primary" :disabled="saving">
              {{ saving ? "Saving…" : "Save" }}
            </button>
            <button @click="closeModal" class="btn cancel">Cancel</button>
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

// Auto-format name to Title Case (e.g. "milk 2litres" → "Milk 2Litres")
function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/(^|\s)\w/g, letter => letter.toUpperCase())
    .replace(/\b(L|Kg|Litres|Ml|G)\b/gi, match => match.toUpperCase())
}

function formatName(name) {
  return toTitleCase(name)
}

onMounted(() => {
  store.loadItems().catch(() => {})
})

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

function formatPrice() {
  let v = String(form.price).replace(/[^\d.]/g, "")
  const parts = v.split(".")
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("")
  if (parts[1]) parts[1] = parts[1].slice(0, 2)
  form.price = parts.join(".")
}

async function saveItem() {
  if (!form.name.trim()) return alert("Please enter a product name")
  if (!form.price || isNaN(Number(form.price))) return alert("Please enter a valid price")

  const payload = {
    name: form.name.trim(),
    price: Number(form.price),
    is_active: form.is_active,
  }

  saving.value = true
  try {
    if (editingItem.value) {
      await store.updateItem(editingItem.value.id, payload)
      alert("Product updated")
    } else {
      await store.addItem(payload)
      alert("Product added successfully")
    }
    closeModal()
  } catch (e) {
    alert("Error: " + (e.message || "Something went wrong"))
  } finally {
    saving.value = false
  }
}

async function deleteItem(id) {
  if (!confirm("Delete this product permanently?")) return
  try {
    await store.deleteItem(id)
    alert("Product deleted")
  } catch (e) {
    alert("Failed to delete")
  }
}
</script>

<style scoped>
.page {
  padding: 1rem;
  min-height: 100vh;
  background: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
  padding-bottom: 5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.add-btn {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 0.9rem 1.2rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.2s;
}

.add-btn:active {
  transform: translateY(1px);
}

/* Item Cards */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-card {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 1rem;
  padding: 1rem 1.1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: transform 0.15s;
}

.item-card:active {
  transform: scale(0.98);
}

.item-info h3 {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
}

.price {
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e293b;
  margin: 0.25rem 0;
}

.status {
  font-size: 0.8rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-weight: 600;
  background: #dcfce7;
  color: #166534;
}

.status.inactive {
  background: #f1f5f9;
  color: #64748b;
}

.actions{
    display: flex;
    gap: 0.4rem;
}

.actions button {
  padding: 0.5rem 0.9rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;

}

.edit-btn {
  background: #e0e7ff;
  color: #4338ca;
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}


.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
  font-size: 1rem;
}

.empty-state.error {
  color: #dc2626;
}


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
  max-width: 420px;
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
  
  margin-bottom: 0.5rem;
  color: #475569;
  font-weight: 500;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #475569;
  flex-wrap: wrao;
}

.checkbox-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkmark {
  width: 22px;
  height: 22px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;
}

.checkbox-label input:checked ~ .checkmark {
  background: #2563eb;
  border-color: #2563eb;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-label input:checked ~ .checkmark:after {
  display: block;
  left: 8px;
  top: 4px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
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
  background: #2563eb;
  color: white;
}

.btn.cancel {
  background: #e2e8f0;
  color: #475569;
}
</style>