<template>
  <div class="install-popup">
    <h3>Install Debtly</h3>

    <p>
      Install Debtly on your device for faster access and
      offline support.
    </p>

    <button @click="install">
      Install App
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(["install"])

const install = () => {
  emit("install")
}

setTimeout(() => {
  showTutorial.value = true
}, 1500)
localStorage.setItem("debtlyInstallPromptSeen", "true")
</script>