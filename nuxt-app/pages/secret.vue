<template>
  <div class="w-full h-full flex justify-center items-center">
    <div class="relative m-4 p-8 rounded-xl shadow-xl flex flex-col items-center overflow-hidden">
      <span class="m-4 text-stapp-pink font-bold">
        {{ $t('secret.logged_with_passkey') }}
      </span>

      <p class="m-4 text-stapp-blue">
        {{ $t('secret.user_email') }}: {{ email }}
      </p>

      <button class="bg-stapp-pink p-2 my-4 text-white rounded-lg" @click="logout">
        {{ $t('secret.logout') }}
      </button>
    </div>
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

  onMounted(() => {
    // Log an screen view
    const analytics = getAnalytics()
    setCurrentScreen(analytics, 'secret')
    logEvent(analytics, 'screen_view')
  })

  async function logout() {
    const auth = getAuth()
    await signOut(auth)
    await navigateTo('/')
  }
</script>