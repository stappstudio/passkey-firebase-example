import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server'
import { saveChallenge, getChallenge } from './data/challenge'
import { getAllUserAuthenticators, getUserAuthenticator } from './data/authenticator'
import { userEmailAlreadyRegistered, getUserCustomToken } from './data/user'

import { ORIGIN, RP_ID } from './constants'
import { PublicKeyCredentialDescriptorFuture } from '@simplewebauthn/typescript-types'

import { i18n } from './i18n'

const loginApp = express()

loginApp.use(express.json())
loginApp.use(cors())
loginApp.use(i18n.init)

loginApp.get(
  ['/options', '/login/options'],
  async (req: express.Request, res: express.Response) => {
  const { email, sessionId } = req.query

  // We must have at least one of them
  if (!email && !sessionId) {
    res.status(400).send({ error: res.__('missing_parameters') })

    return
  }

  // If session id is undefined, email will work as sessionId
  const sessionID: string = (sessionId as string | undefined) ?? (email as string)

  // This might be populated or not, so we need to init it here as undefined
  let allowedCredentials: PublicKeyCredentialDescriptorFuture[] | undefined

  if (email) {
    const userEmail = email as string
    // If an e-mail is provided, we can perform additional checks

    // // Check if user already registered on firebase
    const alreadyRegistered = await userEmailAlreadyRegistered(userEmail)

    if (!alreadyRegistered) {
      res.status(400).send({ error: res.__('email_not_registered', userEmail) })

      return
    }

    // Get only the saved authenticators
    const userAuthenticators = await getAllUserAuthenticators(userEmail)
    allowedCredentials =  userAuthenticators.map(auth => ({
      id: auth.credentialID,
      type: 'public-key',
    }))
  }
  
  try {
    const options = generateAuthenticationOptions({
      allowCredentials: allowedCredentials,
      userVerification: 'preferred'
    })

    await saveChallenge(sessionID, options.challenge)

    res.send(options)
  }
  catch (error) {
    res.status(400).send(error)
  }
})

loginApp.post(
  ['/verify', '/login/verify'],
  async (req: express.Request, res: express.Response) => {
  const { email, sessionId } = req.query

  // Validate parameters
  if (!email || !sessionId) {
    res.status(400).send({ error: res.__('missing_parameters') })

    return
  }

  const userEmail = email as string
  const sessionID = sessionId as string

  try {
    const expectedChallenge = await getChallenge(sessionID)

    if (!expectedChallenge) {
      res.status(400).send({ error: res.__('error_finding_challenge') })
  
      return
    }

    const { body } = req

    const authenticator = await getUserAuthenticator(userEmail, body.id)

    if (!authenticator) {
      res.status(400).send({ error: res.__('error_finding_authenticator', body.id, userEmail) })
  
      return
    }

    const verification = verifyAuthenticationResponse({
      credential: req.body,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator
    })

    const { authenticationInfo } = verification;

    if (!verification.verified || !authenticationInfo) {
      res.status(400).send({ error: res.__('error_authenticating', userEmail) })
  
      return
    }

    // TODO: Update authenticator counter on database

    // Retrieve token from firebase auth
    const customToken = await getUserCustomToken(userEmail)

    res.send({
      "token": customToken
    })
  }
  catch (error) {
    functions.logger.error('Error', {
      "error": error
    })
    res.status(400).send(error)
  }
})

export const login = functions.https.onRequest(loginApp)