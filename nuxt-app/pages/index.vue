<template>
  <div class="w-full h-full flex justify-center items-center">
    <div class="relative m-4 p-8 rounded-xl shadow-xl flex flex-col items-center overflow-hidden">
      <div v-if="isLoading" class="absolute left-0 top-0 right-0 bottom-0 bg-white bg-opacity-50 flex justify-center items-center">
        <CustomLoading />
      </div>
      <img class="w-48" src="~assets/logo_1024.png" />
      <div class="flex flex-col items-end">
        <label v-if="isFormSignup" class="form-label text-stapp-blue">
          {{ $t('login.form.name') }}
        </label>
        <input v-if="isFormSignup" v-model="form.name" type="text" class="form-input" :class="classesForInput('name')" />
        <label class="form-error" :class="{ hidden: !(isFormSignup && hasPressedAnySubmitButton && !form.name) }">
          {{ $t('login.form.mandatory') }}
        </label>
      </div>
      <div class="flex flex-col items-end">
        <label class="form-label text-stapp-blue">
          {{ $t('login.form.email') }}
        </label>
        <input v-model="form.email" autocomplete="webauthn" type="text" class="w-full form-input" :class="classesForInput('email')" />
        <label class="form-error" :class="{ hidden: !(hasPressedAnySubmitButton && !form.email) }">
          {{ $t('login.form.mandatory') }}
        </label>
      </div>
      <label class="form-label opacity-30 text-stapp-blue">
        {{ $t('login.form.password') }}
      </label>
      <input type="text" :value="$t('login.form.password_is_outdated')" disabled class="opacity-30 form-input focus:outline-stapp-pink"  />
      <div class="w-full flex flex-col mt-4">
        <button v-if="isFormSignup" class="form-button bg-stapp-blue" @click="register">
          {{ $t('login.form.signup') }}
        </button>
        <button v-else class="form-button bg-stapp-pink" @click="login">
          {{ $t('login.form.login') }}
        </button>
        <button v-if="isFormSignup" class="text-stapp-pink mt-4 hover:underline" @click="isFormSignup = false">
          {{ $t('login.form.already_signed_up') }}
        </button>
        <button v-else class="text-stapp-blue mt-4 hover:underline" @click="isFormSignup = true">
          {{ $t('login.form.not_signed_up') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
  import { AuthenticationCredentialJSON, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON, RegistrationCredentialJSON } from '@simplewebauthn/typescript-types'
  import { getAuth, signInWithCustomToken } from 'firebase/auth'
  import { getAnalytics, logEvent, setCurrentScreen } from 'firebase/analytics'
  import { FetchError } from 'ohmyfetch';
  import { Buffer } from 'buffer';
  import { useI18n } from 'vue-i18n'
  import CustomLoading from '../components/custom-loading.vue'
  
  const { t } = useI18n()

  const API_URL = 'https://passkey.stapp.studio'

  const form = {
    email: '',
    name: ''
  }

  const isFormSignup = ref(false)
  const hasPressedAnySubmitButton = ref(false)
  const isLoading = ref(false)

  const sessionId = generateSessionId()

  useHead({
    meta: [
      {
        name: 'title',
        property: 'og:title',
        content: 'Passkey Example'
      },
      {
        name: 'type',
        property: 'og:type',
        content: 'website'
      },
      {
        name: 'description',
        property: 'og:description',
        content: 'A example of a signup/login using passkeys'
      },
      {
        name: 'url',
        property: 'og:url',
        content: 'https://passkey.stapp.studio'
      }
    ]
  })

  // View functions
  onMounted(async () => {
    // Log an screen view
    const analytics = getAnalytics()
    setCurrentScreen(analytics, 'login')
    logEvent(analytics, 'screen_view')

    // Attemp to autocomplete
    const options = await getAuthenticationOptions(undefined)
    const asseResp = await startAuthentication(options, true)

    const { token } = await verifyAuthentication(asseResp)

    await firebaseLogin(token)
  })

  // Since our backend is serverless, we don't have sessions to save our challenges into
  // So, we generate it here on the browser and pass this id to the server :) 
  function generateSessionId() {
    let baseArray = new Int8Array(16)
    crypto.getRandomValues(baseArray)
    const sessionId = Buffer.from(baseArray).toString('base64')

    return sessionId
  }

  function classesForInput(field: string) {
    var expectedValue: string | undefined;
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
        alert(t('login.alerts.signup.success'))
        isFormSignup.value = false
      }
      else {
        alert(t('login.alerts.signup.error'))
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

  async function getRegistrationOptions(): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const response: PublicKeyCredentialCreationOptionsJSON = await $fetch(API_URL + '/register/options', {
      params: {
        email: form.email,
        name: form.name
      }
    })

    return response
  }

  interface VerifiedRegistrationResponse {
    verified: boolean;
  };

  async function verifyRegistration(attResp: RegistrationCredentialJSON): Promise<VerifiedRegistrationResponse> {
    const response: VerifiedRegistrationResponse = await $fetch(API_URL + '/register/verify', {
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

      const options = await getAuthenticationOptions(form.email)
      const asseResp = await startAuthentication(options)

      const { token } = await verifyAuthentication(asseResp)

      await firebaseLogin(token)
      
      isLoading.value = false
    }
    catch (error) {
      if (error instanceof FetchError) {
        alert(error.data.error)
        isLoading.value = false
      }
      else {
        console.log(error)
        alert(error)
        isLoading.value = false
      }
    }
  }

  interface AuthenticationOptionsParams {
    sessionId: string,
    email?: string
  }

  async function getAuthenticationOptions(email?: string): Promise<PublicKeyCredentialRequestOptionsJSON> {
    let params: AuthenticationOptionsParams = {
      sessionId,
    }

    // Only add an e-mail to the params if it is not empty
    if (email) {
      params.email = email
    }

    const response: PublicKeyCredentialRequestOptionsJSON = await $fetch(API_URL + '/login/options', {
      params: params
    })

    return response
  }

  interface FirebaseCustomTokenResponse {
    token: string
  }

  async function verifyAuthentication(asseResp: AuthenticationCredentialJSON): Promise<FirebaseCustomTokenResponse> {
    const response: FirebaseCustomTokenResponse = await $fetch(API_URL + '/login/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: asseResp,
      params: {
        sessionId,
        email: form.email,
      }
    })

    return response
  }

  async function firebaseLogin(token: string) {
    const auth = getAuth()
    const credential = await signInWithCustomToken(auth, token)
    
    if (credential && credential.user) {
      await navigateTo('/secret')
    }
    else {
      alert(t('login.alerts.login.error'))
    }
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
