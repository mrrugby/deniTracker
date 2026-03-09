<template>
  <div id="app">

    <TutorialModal
    v-if="showTutorial"
    @close="closeTutorial"
  />

  <InstallPrompt
    v-if="showInstall"
    @install="promptInstall"
  />
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TutorialModal from './components/TutorialModal.vue';
import InstallPrompt from './components/InstallPrompt.vue';
import { usePWAInstall } from './composables/usePWAInstall';

const showTutorial = ref(false)
const showInstall = ref(false)

const { deferredPrompt, promptInstall } = usePWAInstall()

onMounted(() =>{
  const seenTutorial = localStorage.getItem("debtlyTutorialSeen")
  if(!seenTutorial){
    showTutorial.value = true
  }
})

const closeTutorial = () =>{
  localStorage.setItem("debtlyTutorialSeen", "true")
  showTutorial.value = false

  if (deferredPrompt.value){
    showInstall.value = true
  }
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
