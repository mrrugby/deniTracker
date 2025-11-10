<template>
  <header class="top-navbar">
    <div class="brand">
      <span class="icon">🏦</span>
      <h1>{{ title }}</h1>
    </div>
    <button v-if="showSettings" class="settings-btn" @click="onSettingsClick">
      ⚙️
    </button>
  </header>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  title: { type: String, default: "DeniTracker" },
  showSettings: { type: Boolean, default: true }
});

const emit = defineEmits(["settings"]);

const onSettingsClick = () => {
  emit("settings");
};
</script>

<style scoped>
.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 50;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.icon {
  font-size: 1.8rem;
}

.settings-btn {
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
}
</style>
