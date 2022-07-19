import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'
import { saveChallenge, getChallenge } from './data/challenge'
import { saveAuthenticator } from './data/authenticator'
import { userEmailAlreadyRegistered, createUser } from './data/user'

import { ORIGIN, RP_ID, RP_NAME } from './constants'
import { AuthenticatorDevice } from '@simplewebauthn/typescript-types'

import { i18n } from './i18n'

const registerApp = express()

registerApp.use(express.json())
registerApp.use(cors())
registerApp.use(i18n.init)

registerApp.get(
  ['/options', '/register/options'],
  async (req: express.Request, res: express.Response) => {
    const { email, name } = req.query

    // Validate query parameters
    if (!email || !name) {
      res.status(400).send({ error: res.__('missing_parameters') })

      return
    }

    const userEmail = email as string
    const userName = name as string

    // Check if user already registered on firebase
    const alreadyRegistered = await userEmailAlreadyRegistered(userEmail)

    if (alreadyRegistered) {
      res.status(400).send({ error: res.__('email_already_registered', userEmail) })

      return
    }

    try {
      // Generate registration options
      const options = generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userID: userEmail,
        userName,
      })

      // Save the challenge on firestore to retrieve them later
      await saveChallenge(userEmail, options.challenge)

      res.send(options)
    }
    catch (error) {
      res.status(400).send(error)
    }
  }
)

registerApp.post(
  ['/verify', '/register/verify'],
  async (req: express.Request, res: express.Response) => {
  const { email } = req.query

  // Validate parameters
  if (!email) {
    res.status(400).send({ error: res.__('missing_parameters') })

    return
  }

  const userEmail = email as string

  try {
    // Retrieve the challenge from firestore
    const expectedChallenge = await getChallenge(userEmail)

    if (!expectedChallenge) {
      res.status(400).send({ error: res.__('error_finding_challenge') })
  
      return
    }

    const verification = await verifyRegistrationResponse({
      credential: req.body,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID
    })

    const { registrationInfo } = verification;

    if (!verification.verified || !registrationInfo) {
      res.status(400).send({ error: res.__('error_registering', userEmail) })
  
      return
    }

    // Registration complete!

    // Create the user on Firebase Auth
    await createUser(userEmail)

    const { credentialPublicKey, credentialID, counter } = registrationInfo;

    const newAuthenticator: AuthenticatorDevice = {
      credentialID,
      credentialPublicKey,
      counter,
    };

    await saveAuthenticator(userEmail, newAuthenticator)

    res.send(verification)
  }
  catch (error) {
    functions.logger.error('Error', {
      "error": error
    })
    res.status(400).send(error)
  }
})

export const register = functions.https.onRequest(registerApp)