<template>
  <div class="overlay">
    <div class="modal">

      <h3>Install Debtly</h3>

      <p>
        Install Debtly on your device for faster access
        and offline support.
      </p>

      <div class="buttons">

        <button class="secondary" @click="$emit('close')">
          Maybe Later
        </button>

        <button class="primary" @click="$emit('install')">
          Install App
        </button>

      </div>

    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal {
  background: white;
  width: 360px;
  max-width: 90%;
  padding: 22px;
  border-radius: 14px;
  text-align: center;
  box-shadow: 0 10px 35px rgba(0,0,0,0.25);
}

.buttons {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

.primary {
  flex: 1;
  background: #FF4C29;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.secondary {
  flex: 1;
  background: transparent;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}
</style>