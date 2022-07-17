<template>
  <div class="w-full h-full flex justify-center items-center">
    <div class="p-8 rounded-xl shadow-lg">
      <img class="w-64" src="~assets/logo_1024.png" />
      <label class="form-label text-stapp-blue">Full Name</label>
      <input v-model="form.name" type="text" class="form-input focus:outline-stapp-pink"  />
      <label class="form-label text-stapp-blue">Username</label>
      <input v-model="form.username" type="text" class="form-input focus:outline-stapp-pink"  />
      <div class="flex justify-between">
        <button class="bg-stapp-pink p-2 my-4 text-white rounded-lg" @click="register">Register</button>
        <button class="bg-stapp-blue p-2 my-4 text-white rounded-lg" @click="login">Login</button>
      </div>

      <button class="text-stapp-pink" @click="loginFire">Login</button>
      <button class="text-stapp-pink" @click="logout">Logout</button>
    </div>
  </div>
</template>

<script setup>
  import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
  import { useStore } from '@/stores/user'
  import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'

  async function loginFire() {
    const auth = getAuth()
    try {
      const credentials = signInWithEmailAndPassword(
        auth,
        'email',
        'senha'
      )
      console.log(credentials)
    }
    catch (error) {
      console.log(error)
    }
  }

  async function logout() {
    const auth = getAuth()
    await signOut(auth)
  }

  const API_URL = 'https://passkey.stapp.studio'

  const form = {
    username: '',
    name: ''
  }

  async function register() {
    const options = await getRegistrationOptions()

    try {
      const attResp = await startRegistration(options)

      const verification = await verifyRegistration(attResp)
      console.log(verification)
    }
    catch (error) {
      console.log(error)
    }
  }

  async function getRegistrationOptions() {
    const response = await $fetch(API_URL + '/register/options', {
      params: {
        id: form.username,
        name: form.name
      }
    })

    return response
  }

  async function verifyRegistration(attResp) {
    const response = await $fetch(API_URL + '/register/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: attResp,
      params: {
        id: form.username,
      }
    })

    return response
  }

  async function login() {
    const options = await getAuthenticationOptions()

    try {
      const asseResp = await startAuthentication(options)

      console.log(asseResp)
      const verification = await verifyAuthentication(asseResp)
      console.log(asseResp)
    }
    catch (error) {
      console.log(error)
    }
  }

  async function getAuthenticationOptions() {
    const response = await $fetch(API_URL + '/login/options', {
      params: {
        id: form.username
      }
    })

    return response
  }

  async function verifyAuthentication(asseResp) {
    const response = await $fetch(API_URL + '/login/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: asseResp,
      params: {
        id: form.username,
      }
    })

    return response
  }
</script>

<style lang="pcss">
.form-label {
  @apply block text-stapp-blue my-2
}

.form-input {
  @apply block outline outline-1 rounded-lg outline-gray-300 p-2
}
</style>
