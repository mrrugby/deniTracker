<template>
    <div class="modal">
        <h2>Welcome to Debtly</h2>
        <p>watch thit tutorial to see how Debtly works.</p>

        <iframe
      width="100%"
      height="220"
      src="https://www.youtube.com/embed/YOUR_VIDEO"
      allowfullscreen
    ></iframe>

    <div class="buttons">
        <button @click="$emit('close')">Skip</button>
        <button @click="$emit('close')">Got it</button>
    </div>
    </div>
</template>