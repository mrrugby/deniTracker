<template>
      <TopNavbar/>
    <router-view />
   
    <Navbar/>
   
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import TopNavbar from '@/components/TopNavbar.vue';

export default{
    name: 'App',
    components: { TopNavbar, Navbar }
}
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f6f7f8;
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
