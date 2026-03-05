<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// No script needed for now
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
