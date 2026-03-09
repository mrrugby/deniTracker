<template>
  <div class="overlay">
    <div class="modal">
      <h2>Welcome to Debtly</h2>

      <p class="subtitle">
        Watch a quick tutorial to see how Debtly works.
      </p>

      <div class="video-container">
        <iframe
          src="https://www.youtube.com/embed/YOUR_VIDEO"
          allowfullscreen
        ></iframe>
      </div>

      <div class="buttons">
        <button class="secondary" @click="$emit('close')">
          Skip
        </button>

        <button class="primary" @click="$emit('close')">
          Got it
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
  width: 420px;
  max-width: 90%;
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.25);
  text-align: center;
}

.subtitle {
  color: #555;
  margin-bottom: 16px;
}

.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  margin-bottom: 18px;
}

.video-container iframe {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.primary {
  background: #FF4C29;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.secondary {
  background: transparent;
  border: 1px solid #ccc;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}
</style>