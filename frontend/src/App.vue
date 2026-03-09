<template>
  <div id="app">

    <AppSplash v-if="loading" />
  
    <div v-else>

      <TutorialModal
        v-if="showTutorial"
        @close="closeTutorial"
      />
      <InstallPrompt
        v-if="showInstall"
        @install="handleInstall"
      />
      <router-view />

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

import TutorialModal from "./components/TutorialModal.vue"
import InstallPrompt from "./components/InstallPrompt.vue"
import AppSplash from "./components/AppSplash.vue"

import { usePWAInstall } from "./composables/usePWAInstall"

const loading = ref(true)
const showTutorial = ref(false)
const showInstall = ref(false)

const { deferredPrompt, promptInstall } = usePWAInstall()

onMounted(() => {

  // Splash screen timer
  setTimeout(() => {
    loading.value = false
  }, 1200)

  const seenTutorial = localStorage.getItem("debtlyTutorialSeen")

  if (!seenTutorial) {
    setTimeout(() => {
      showTutorial.value = true
    }, 1300)
  }

})


const closeTutorial = () => {

  localStorage.setItem("debtlyTutorialSeen", "true")

  showTutorial.value = false

  const installSeen = localStorage.getItem("debtlyInstallSeen")

  if (deferredPrompt.value && !installSeen) {
    showInstall.value = true
  }

}


const handleInstall = async () => {

  await promptInstall()

  localStorage.setItem("debtlyInstallSeen", "true")

  showInstall.value = false

}
</script>

<style>
* {
  -webkit-tap-highlight-color: transparent;
}

button {
  appearance: none;
  -webkit-appearance: none;
}

button:focus {
  outline: none;
}

body {
  margin: 0;
  background: #f9fafb;
  font-family: system-ui, sans-serif;
}
</style>