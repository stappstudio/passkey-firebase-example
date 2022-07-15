import { AuthenticatorDevice } from '@simplewebauthn/typescript-types'
import { getFirestore } from 'firebase-admin/firestore'

const COLLECTION = 'authenticators'

export async function saveAuthenticator(userID: string, authenticator: AuthenticatorDevice) {
  const firestore = getFirestore()

  await firestore.collection(COLLECTION).doc().set({
    userID,
    ...authenticator,
  })
}

export async function getUserAuthenticators(userID: string): Promise<AuthenticatorDevice[]> {
  const firestore = getFirestore()

  const snapshot = await firestore.collection(COLLECTION).where('userID', '==', userID).get()

  const authenticators: AuthenticatorDevice[] = []

  snapshot.forEach((doc) => {
    const data = doc.data()
    authenticators.push({
      credentialPublicKey: data.credentialPublicKey,
      credentialID: data.credentialID,
      counter: data.counter as number
    })
  })

  return authenticators
}