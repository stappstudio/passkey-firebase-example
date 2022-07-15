import { getFirestore } from 'firebase-admin/firestore'

const COLLECTION = 'challenges'

export async function saveChallenge(userID: string, challenge: string) {
  const firestore = getFirestore()

  await firestore.collection(COLLECTION).doc(userID).set({
    challenge: challenge
  })
}

export async function getChallenge(userID: string): Promise<string> {
  const firestore = getFirestore()

  const challengeDoc = await firestore.collection(COLLECTION).doc(userID).get()
  const expectedChallenge = challengeDoc.get('challenge')

  return expectedChallenge
}