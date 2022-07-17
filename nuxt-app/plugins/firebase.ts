import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, onIdTokenChanged } from 'firebase/auth'
import { useStore } from '@/stores/user'

// Just exports the firebaseConfig object with apiKey and all other codes as specified in the documentation 
import { firebaseConfig } from '@/firebase.config'

const firebaseApp = initializeApp(firebaseConfig)

export default defineNuxtPlugin(async nuxtApp => {
  const userState = useStore()

  const startAuthListener = async () => {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(getAuth(), (user) => {
        userState.user = user
        resolve(null)
      })
    })
  }

  await startAuthListener()

  onIdTokenChanged(getAuth(), async (user) => {
    if (user != null) {
      const token = await user.getIdToken()
      console.log(`firebase token: ${token}`)
    }
  })
})