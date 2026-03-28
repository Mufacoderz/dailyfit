<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
onMounted(() => { if (auth.isLoggedIn) auth.fetchMe() })
</script>
