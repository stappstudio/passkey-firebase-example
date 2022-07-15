import { AuthenticatorDevice } from '@simplewebauthn/typescript-types'
import { getFirestore } from 'firebase-admin/firestore'
import base64url from 'base64url';

const COLLECTION = 'authenticators'

export async function saveAuthenticator(userID: string, authenticator: AuthenticatorDevice) {
  const firestore = getFirestore()

  await firestore.collection(COLLECTION).doc().set({
    userID,
    credentialPublicKey: base64url.encode(authenticator.credentialPublicKey),
    credentialID: base64url.encode(authenticator.credentialID),
    counter: authenticator.counter
  })
}

export async function getAllUserAuthenticators(userID: string): Promise<AuthenticatorDevice[]> {
  const firestore = getFirestore()

  const snapshot = await firestore.collection(COLLECTION).where('userID', '==', userID).get()

  const authenticators: AuthenticatorDevice[] = []

  snapshot.forEach((doc) => {
    const data = doc.data()
    authenticators.push({
      credentialPublicKey: base64url.toBuffer(data.credentialPublicKey),
      credentialID: base64url.toBuffer(data.credentialID),
      counter: data.counter as number
    })
  })

  return authenticators
}

export async function getUserAuthenticator(userID: string, credentialID: string): Promise<AuthenticatorDevice | undefined> {
  const firestore = getFirestore()

  const snapshot = await firestore.collection(COLLECTION)
    .where('userID', '==', userID)
    .where('credentialID', '==', credentialID)
    .get()

  let authenticator: AuthenticatorDevice | undefined = undefined

  if(!snapshot.empty) {
    const data = snapshot.docs[0].data()
    authenticator = {
      credentialPublicKey: base64url.toBuffer(data.credentialPublicKey),
      credentialID: base64url.toBuffer(data.credentialID),
      counter: data.counter as number
    }
  }

  return authenticator
}