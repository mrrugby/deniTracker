<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import BaseToastStack from './components/BaseToastStack.vue';
import BottomNav from './components/BottomNav.vue';
import { useLedger } from './composables/useLedger';

const route = useRoute();
const router = useRouter();
const ledger = useLedger();

const installPrompt = ref(null); 
const showInstallBanner = ref(false);

const isOffline = ref(!navigator.onLine);

const currentTitle = computed(() => {
  if (route.name === 'customer-profile') {
    return ledger.findCustomerById(route.params.id)?.name || 'Customer profile';
  }
  return route.meta.title || 'Debtly';
});

const currentSubtitle = computed(() => {
  if (route.name === 'customer-profile') return 'Customer Transactions History';
  if (route.name === 'dashboard') return isOffline.value ? 'Offline mode active' : 'Ready for today';
});

const canGoBack = computed(() => route.name === 'customer-profile');

function handleBeforeInstallPrompt(event) {
  event.preventDefault();
  installPrompt.value = event;
  showInstallBanner.value = true;
}

async function installApp() {
  if (!installPrompt.value) return;

  
  installPrompt.value.prompt();

  // Wait for the user’s choice
  const { outcome } = await installPrompt.value.userChoice;
  console.log('Install outcome:', outcome);

  showInstallBanner.value = false;
  installPrompt.value = null;
}

function handleOnline() {
  isOffline.value = false;
}
function handleOffline() {
  isOffline.value = true;
}

onMounted(async () => {
  await ledger.init();

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', () => {
    showInstallBanner.value = false;
    installPrompt.value = null;
  });

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});
</script>

<template>
  <div class="app-shell">
    <AppHeader :title="currentTitle" :subtitle="currentSubtitle" :can-go-back="canGoBack" @back="router.back()">
      <template #action>
        <span class="status-pill" :class="{ offline: isOffline }">
          {{ isOffline ? 'Offline' : 'Ready' }}
        </span>
      </template>
    </AppHeader>

    <main class="main-shell">
      <section v-if="showInstallBanner" class="install-banner">
        <div>
          <p class="section-kicker">Install Debtly</p>
          <h2>Use it like a native app on your phone.</h2>
        </div>
        <button type="button" class="secondary-button" @click="installApp">Install</button>
      </section>

      <section v-if="!ledger.isReady.value" class="section-card">
        <p class="section-kicker">Starting up</p>
        <h2>Loading your local ledger...</h2>
      </section>

      <RouterView v-else />
    </main>

    <BottomNav />
    <BaseToastStack />
  </div>
</template>
