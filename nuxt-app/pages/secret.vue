<template>
  <div>
    You are seing this because you logged in with a passkey!

    User e-mail: {{ email }}

    <button class="bg-stapp-pink p-2 my-4 text-white rounded-lg" @click="logout">Sign Out</button>
  </div>
</template>

<script setup>
  import { useStore } from '@/stores/user'
  import { getAuth, signOut } from 'firebase/auth'
  
  definePageMeta({
    middleware: 'auth-middleware'
  })

  const userState = useStore()

  const email = computed(() => userState?.user?.email)

  async function logout() {
    const auth = getAuth()
    await signOut(auth)
    await navigateTo('/')
  }
</script>