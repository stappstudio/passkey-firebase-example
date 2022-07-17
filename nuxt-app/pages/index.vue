<template>
  <div class="w-full h-full flex justify-center items-center">
    <div class="relative m-4 p-8 rounded-xl shadow-xl flex flex-col items-center overflow-hidden">
      <div v-if="isLoading" class="absolute left-0 top-0 right-0 bottom-0 bg-white bg-opacity-50 flex justify-center items-center">
        <CustomLoading />
      </div>
      <img class="w-48" src="~assets/logo_1024.png" />
      <div>
        <label v-if="isFormSignup" class="form-label text-stapp-blue">Nome</label>
        <input v-if="isFormSignup" v-model="form.name" type="text" class="form-input" :class="classesForInput('name')" />
        <label class="form-error" :class="{ hidden: !(hasPressedAnySubmitButton && !form.name) }">Campo obrigatório</label>
      </div>
      <div class="flex flex-col items-end">
        <label class="form-label text-stapp-blue">E-mail</label>
        <input v-model="form.email" type="text" class="w-full form-input" :class="classesForInput('email')" />
        <label class="form-error" :class="{ hidden: !(hasPressedAnySubmitButton && !form.email) }">Campo obrigatório</label>
      </div>
      <label class="form-label opacity-30 text-stapp-blue">Senha</label>
      <input type="text" value="Senha? Pra quê isso?" disabled class="opacity-30 form-input focus:outline-stapp-pink"  />
      <div class="w-full flex flex-col mt-4">
        <button v-if="isFormSignup" class="form-button bg-stapp-blue" @click="register">Cadastrar-se</button>
        <button v-else class="form-button bg-stapp-pink" @click="login">Fazer Login</button>
        <button v-if="isFormSignup" class="text-stapp-pink mt-4 hover:underline" @click="isFormSignup = false">Já tenho cadastro</button>
        <button v-else class="text-stapp-blue mt-4 hover:underline" @click="isFormSignup = true">Ainda não tenho cadastro</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
  import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { FetchError } from 'ohmyfetch';
import CustomLoading from '../components/custom-loading.vue'

  const API_URL = 'https://passkey.stapp.studio'

  const form = {
    email: '',
    name: ''
  }

  const isFormSignup = ref(false)
  const hasPressedAnySubmitButton = ref(false)
  const isLoading = ref(false)

  // View functions
  function classesForInput(field) {
    var expectedValue;
    if (field == 'email') {
      expectedValue = form.email
    }
    else {
      expectedValue = form.name
    }

    const hasError = hasPressedAnySubmitButton.value && !expectedValue

    return {
      'outline-red-500': hasError,
      'outline-gray-300': !hasError,
      'focus:outline-stapp-pink': !hasError
    }
  }

  // Register/Login backend methods
  async function register() {
    hasPressedAnySubmitButton.value = true

    if (!form.name || !form.email) {
      return
    }

    try {
      isLoading.value = true
      const options = await getRegistrationOptions()
      
      const attResp = await startRegistration(options)

      const verification = await verifyRegistration(attResp)

      if (verification.verified) {
        alert('Usuário cadastrado!')
        isFormSignup.value = false
      }
      else {
        alert('Ocorreu um erro ao cadastrar')
      }

      isLoading.value = false
    }
    catch (error) {
      if (error instanceof FetchError) {
        alert(error.data.error)
      }
      else {
        console.log(error)
        alert(error)
      }
      isLoading.value = false
    }
  }

  async function getRegistrationOptions() {
    const response = await $fetch(API_URL + '/register/options', {
      params: {
        email: form.email,
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
        email: form.email,
      }
    })

    return response
  }

  async function login() {
    hasPressedAnySubmitButton.value = true

    if (!form.email) {
      return
    }


    try {
      isLoading.value = true

      const options = await getAuthenticationOptions()
      const asseResp = await startAuthentication(options)

      const { token } = await verifyAuthentication(asseResp)

      const auth = getAuth()
      const credential = await signInWithCustomToken(auth, token)
      
      if (credential && credential.user) {
        await navigateTo('/secret')
      }
      else {
        alert('Erro ao realizar o login :(')
      }
      
      isLoading.value = false
    }
    catch (error) {
      if (error instanceof FetchError) {
        alert(error.data.error)
      }
      else {
        console.log(error)
        alert(error)
        isLoading.value = false
      }
    }
  }

  async function getAuthenticationOptions() {
    const response = await $fetch(API_URL + '/login/options', {
      params: {
        email: form.email
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
        email: form.email,
      }
    })

    return response
  }
</script>

<style lang="pcss">
html, body, #__nuxt, #__layout {
      height:100%; /*both html and body*/
}
body {
    margin: 0; /*reset default margin*/
}

.form-label {
  @apply block text-stapp-blue my-2 w-64
}

.form-input {
  @apply w-full block outline outline-1 rounded-lg p-2
}

.form-button {
  @apply w-full block py-2 px-8 my-1 text-white rounded-lg
}

.form-error {
  @apply my-1 text-red-500 text-xs;
}
</style>
