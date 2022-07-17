import { getAuth } from 'firebase-admin/auth'
import { randomBytes } from 'crypto'

export async function userEmailAlreadyRegistered(userEmail: string): Promise<Boolean> {
  const auth = getAuth()

  try {
    await auth.getUserByEmail(userEmail)

    return true
  }
  catch (error) {
    return false
  }
}

export async function createUser(userEmail: string) {
  const auth = getAuth()

  // Password? What is that? Sounds like something really old and outdated.'
  // Let's generate some random bytes to fullfil this requirement ;)
  var password = randomBytes(16).toString('base64')

  auth.createUser({
    email: userEmail,
    password: password
  })
}

export async function getUserCustomToken(userEmail: string): Promise<string> {
  const auth = getAuth()

  const user = await auth.getUserByEmail(userEmail)

  const customToken = auth.createCustomToken(user.uid)

  return customToken
}