<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

onMounted(() => {
  // 检查登录状态
  userStore.checkLoginStatus()
})
</script>

<style lang="scss">
.app-container {
  width: 100%;
  height: 100vh;
}
</style>