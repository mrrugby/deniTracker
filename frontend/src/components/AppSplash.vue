<template>
  <div class="splash">
    <img src="/icons/android/android-launchericon-192-192.png" class="logo" />

    <h1>Debtly</h1>

    <div class="loader"></div>
  </div>
</template>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  background: #082032;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.logo {
  width: 80px;
  margin-bottom: 16px;
  animation: fadeIn 0.8s ease;
}

.loader {
  margin-top: 20px;
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>