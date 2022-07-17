import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, onIdTokenChanged } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { useStore } from '@/stores/user'

const firebaseConfig = {
};


const firebaseApp = initializeApp(firebaseConfig)

export default defineNuxtPlugin(async nuxtApp => {
  const userState = useStore()

  const startAuthListener = async () => {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(getAuth(), (user) => {
        console.log('onAuthStateChanged: ' + user)
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