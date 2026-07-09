<script setup>
import { onMounted, ref } from 'vue';
import ConfirmModal from '../components/modals/ConfirmModal.vue';
import { useLedger } from '../composables/useLedger';
import { useModalState } from '../composables/useModalState';
import { useToast } from '../composables/useToast';
import { bytesToSize, downloadJsonFile, readJsonFile } from '../local';

const ledger = useLedger();
const toast = useToast();
const resetModal = useModalState(false);
const storageUsage = ref('Checking...');
const storageQuota = ref('Checking...');
const importInput = ref(null);

function openImportPicker() {
  importInput.value?.click();
}

async function refreshEstimate() {
  if (!navigator.storage?.estimate) {
    storageUsage.value = 'Not supported';
    storageQuota.value = 'Not supported';
    return;
  }

  const estimate = await navigator.storage.estimate();
  storageUsage.value = bytesToSize(estimate.usage);
  storageQuota.value = bytesToSize(estimate.quota);
}

async function exportBackup() {
  try {
    const data = await ledger.exportBackup();
    downloadJsonFile(`debtly-backup-${Date.now()}.json`, data);
    toast.success('Backup exported successfully');
  } catch (error) {
    toast.error(error.message || 'Could not export backup');
  }
}

async function onImportChange(event) {
  try {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const payload = await readJsonFile(file);
    await ledger.importBackup(payload);
    await refreshEstimate();
    toast.success('Backup imported successfully');
  } catch (error) {
    toast.error(error.message || 'Could not import backup');
  } finally {
    event.target.value = '';
  }
}

async function resetAppData() {
  try {
    await ledger.resetApp();
    localStorage.clear();
    await refreshEstimate();
    toast.success('App data reset successfully');
  } catch (error) {
    toast.error(error.message || 'Could not reset app data');
  } finally {
    resetModal.close();
  }
}

onMounted(() => {
  refreshEstimate();
});
</script>

<template>
  <div class="page-stack">
    <section class="section-card">
      <p class="section-kicker">About Debtly</p>
      <h2>Offline debt tracking built for daily shop use.</h2>
      <p class="settings-copy">
        Debtly stores customers, stock items, and ledger transactions locally in IndexedDB so it keeps
        working even when the network is unavailable.
      </p>
    </section>

    <section class="section-card">
      <div class="section-head">
        <div>
          <p class="section-kicker">Storage</p>
          <h2>Device usage</h2>
        </div>
        <button type="button" class="ghost-button" @click="refreshEstimate">Refresh</button>
      </div>

      <div class="settings-grid">
        <article class="settings-stat">
          <span>Used storage</span>
          <strong>{{ storageUsage }}</strong>
        </article>
        <article class="settings-stat">
          <span>Available quota</span>
          <strong>{{ storageQuota }}</strong>
        </article>
      </div>
    </section>

    <section class="section-card">
      <p class="section-kicker">Safety</p>
      <h2>Backups and reset</h2>

      <div class="settings-actions">
        <button type="button" class="primary-button" @click="exportBackup">Export backup</button>
        <button type="button" class="secondary-button" @click="openImportPicker">Import backup</button>
        <button type="button" class="danger-button" @click="resetModal.open()">Reset app</button>
      </div>

      <input ref="importInput" hidden type="file" accept="application/json" @change="onImportChange" />
    </section>

    <ConfirmModal
      :open="resetModal.isOpen.value"
      title="Reset app data"
      description="This clears IndexedDB and local settings on this device. Export a backup first if you may need the data later."
      confirm-label="Reset app"
      @close="resetModal.close()"
      @confirm="resetAppData"
    />
  </div>
</template>

<style scoped>
.settings-copy {
  color: var(--muted);
}

.settings-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.settings-stat {
  padding: 1rem;
  border-radius: 1.1rem;
  background: rgba(244, 239, 229, 0.78);
}

.settings-stat span {
  display: block;
  color: var(--muted);
  font-size: 0.85rem;
}

.settings-stat strong {
  display: block;
  margin-top: 0.35rem;
}

.settings-actions {
  display: grid;
  gap: 0.75rem;
}
</style>
