import { ref } from 'vue';

export function useModalState(defaultValue = false) {
  const isOpen = ref(defaultValue);

  return {
    isOpen,
    open() {
      isOpen.value = true;
    },
    close() {
      isOpen.value = false;
    }
  };
}
