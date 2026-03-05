<template>
  <teleport to="body">
    <div v-if="show" class="modal-backdrop" @click="close">
      <div class="modal-content" @click.stop>
        <h3>Settings</h3>

        <div class="settings-content">

          <!-- Storage Metrics -->
          <div class="card storage-box">
            <h3>📊 Storage Usage</h3>

            <p>
              {{ formatBytes(usage) }} / {{ formatBytes(quota) }}
            </p>

            <div class="storage-bar">
              <div
                class="storage-fill"
                :style="{ width: usagePercent + '%' }"
              />
            </div>

            <small>{{ usagePercent }}% used</small>
          </div>

          <!-- About -->
          <div class="card storage-box">
            <h3>ℹ️ About Debtly</h3>
            <p>
              Debtly stores all your customers, stock, and transaction data
              securely on your device.<br>
              No data is sent to external servers.
            </p>
          </div>

          <!-- Danger Zone -->
          <div class="card danger storage-box">
            <h3>🚨 Data Reset</h3>
            <p>
              Resetting the app will permanently remove all records stored on this device.<br>
              This action cannot be undone.
            </p>

            <button class="btn primary" @click="showReset = true">
              Delete Data
            </button>
          </div>

        </div>
      </div>
    </div>
  </teleport>

  <!-- Reset Confirmation Modal -->
  <teleport to="body">
    <div v-if="showReset" class="modal-backdrop" @click="closeReset">
      <div class="modal-content" @click.stop>
        <h3>Confirm Reset</h3>

        <p class="warning">
          This action is permanent and cannot be undone.
        </p>

        <p>Type <strong>DELETE</strong> below to confirm.</p>

        <input
          v-model="confirmationText"
          placeholder="Type DELETE"
        />

        <div class="modal-actions">
          <button
            class="btn primary"
            :disabled="confirmationText !== 'DELETE'"
            @click="resetApp"
          >
            Permanently Delete
          </button>

          <button class="btn cancel" @click="closeReset">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </teleport>

  <!-- Native Style Toast -->
  <teleport to="body">
    <div v-if="toast.show" class="toast">
      {{ toast.message }}
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from "vue"
import { useStorageStats } from "@/composables/useStorageStats"

const { usage, quota } = useStorageStats()

const usagePercent = computed(() => {
  if (!quota.value) return 0
  return ((usage.value / quota.value) * 100).toFixed(1)
})

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: "update:show", value: boolean): void
}>()

const showReset = ref(false)
const confirmationText = ref("")

/* -------------------------
   Native Toast
-------------------------- */

const toast = ref({
  show: false,
  message: ""
})

function showToast(message: string) {
  toast.value.message = message
  toast.value.show = true

  setTimeout(() => {
    toast.value.show = false
  }, 1000)
}

/* -------------------------
   Helpers
-------------------------- */

function formatBytes(bytes: number) {
  if (!bytes) return "0 B"

  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let i = 0

  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }

  return `${value.toFixed(2)} ${units[i]}`
}

function close() {
  emit("update:show", false)
}

function closeReset() {
  showReset.value = false
  confirmationText.value = ""
}

/* -------------------------
   Reset App
-------------------------- */

function resetApp() {
  localStorage.clear()

  if (window.indexedDB && "databases" in indexedDB) {
    indexedDB.databases().then((dbs: any) => {
      dbs.forEach((db: any) => {
        if (db.name) indexedDB.deleteDatabase(db.name)
      })
    })
  }

  showToast("All data has been permanently deleted.")

  setTimeout(() => {
    location.reload()
  }, 1200)
}
</script>

<style scoped>
.storage-box {
padding: 1rem;
border-radius: 12px;
background: #f8fafc;
margin-top: 1rem;
}

.storage-bar {
height: 8px;
background: #e2e8f0;
border-radius: 999px;
margin-top: 8px;
overflow: hidden;
}

.storage-fill {
height: 100%;
background: #16a34a;
transition: width 0.3s ease;
}

.warning {
color: #dc2626;
font-size: 0.85rem;
}

/* Modal */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
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
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.modal-content h3 {
  margin: 0 0 1rem;
  text-align: center;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

.modal-content input {
  width: 100%;
  padding: 0.9rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  box-sizing: border-box;
  margin-top: 0.5rem;
}

.modal-content input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn.primary {
  flex: 1;
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn.primary:disabled {
  background: #93c5fd;
}

.btn.cancel {
  flex: 1;
  background: #e2e8f0;
  border: none;
  border-radius: 0.75rem;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
}

/* -------------------
   Native Toast
-------------------- */

.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #111827;
  color: white;
  padding: 0.8rem 1.2rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  animation: toastSlide 0.25s ease;
  z-index: 2000;
}

@keyframes toastSlide {
  from {
    transform: translate(-50%, 20px);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}
</style>