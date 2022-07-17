import { useStore } from '@/stores/user'

export default defineNuxtRouteMiddleware((to, from) => {
  const userState = useStore()

  if (userState.user == null) {
    return navigateTo('/')
  }
})