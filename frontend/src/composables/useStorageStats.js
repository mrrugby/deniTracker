import { ref, onMounted } from "vue";

export function useStorageStats() {
  const usage = ref(0);
  const quota = ref(0);

  async function loadStats() {
    try {
      if (!navigator.storage || !navigator.storage.estimate) return;

      const estimate = await navigator.storage.estimate();

      usage.value = estimate.usage || 0;
      quota.value = estimate.quota || 0;
    } catch (err) {
      console.warn("Storage stats load failed", err);
    }
  }

  onMounted(loadStats);

  return { usage, quota, loadStats };
}