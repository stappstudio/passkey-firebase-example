<template>
  <div class="w-full h-full flex justify-center items-center">
    <div class="p-8 rounded-xl shadow-lg">
      <img class="w-64" src="~assets/logo_1024.png" />
      <label class="form-label text-stapp-blue">Full Name</label>
      <input v-model="form.name" type="text" class="form-input focus:outline-stapp-pink"  />
      <label class="form-label text-stapp-blue">Username</label>
      <input v-model="form.username" type="text" class="form-input focus:outline-stapp-pink"  />
      <button class="bg-stapp-pink p-2 my-4 text-white rounded-lg" @click="register">Register</button>
    </div>
  </div>
</template>

<script setup>
  import { startRegistration } from '@simplewebauthn/browser';

  const API_URL = 'http://localhost:8787'

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

    console.log(response)

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

    console.log(response)

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
