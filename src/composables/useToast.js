import { computed, ref } from 'vue';

const toastItems = ref([]);
let toastId = 0;

function removeToast(id) {
  toastItems.value = toastItems.value.filter((toast) => toast.id !== id);
}

function pushToast(message, tone = 'success') {
  const id = ++toastId;
  toastItems.value = [...toastItems.value, { id, message, tone }];

  window.setTimeout(() => {
    removeToast(id);
  }, 3200);
}

export function useToast() {
  return {
    toasts: computed(() => toastItems.value),
    removeToast,
    success(message) {
      pushToast(message, 'success');
    },
    error(message) {
      pushToast(message, 'error');
    },
    warning(message) {
      pushToast(message, 'warning');
    }
  };
}
