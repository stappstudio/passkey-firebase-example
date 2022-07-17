<template>
  User e-mail: {{ email }}
</template>

<script setup>
  import { useStore } from '@/stores/user'
  
  definePageMeta({
    middleware: 'auth-middleware'
  })

  const userState = useStore()

  const email = computed(() => userState?.user?.email)
</script>