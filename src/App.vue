<template>
  <div id="app">
    <!-- 导航栏 -->
    <Navbar />

    <!-- 页面内容会根据路由切换 -->
    <router-view />

    <!-- 页脚 -->
    <footer class="text-center py-3 bg-light mt-5">
      <p class="mb-0">© 2025 MindHaven. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

<style>
body {
  font-family: Arial, sans-serif;
}
</style>
