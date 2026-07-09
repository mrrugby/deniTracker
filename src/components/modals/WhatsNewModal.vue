<script setup>
defineProps({
  version: String,
  notes: Array,
  show: Boolean
})

async function updateApp() {
  await updateSW(true)
}

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="overlay">
    <div class="modal">

      <h2>🎉 What's New</h2>

      <p>Debtly {{ version }}</p>

      <ul>
        <li
          v-for="note in notes"
          :key="note"
        >
          {{ note }}
        </li>
      </ul>

      <button
        class="primary-button"
        @click="emit('close')"
      >
        update
      </button>

    </div>
  </div>
</template>