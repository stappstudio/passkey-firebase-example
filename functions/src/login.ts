import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server'
import { saveChallenge, getChallenge } from './data/challenge'
import { getAllUserAuthenticators, getUserAuthenticator } from './data/authenticator'
import { userEmailAlreadyRegistered, getUserCustomToken } from './data/user'

import { ORIGIN, RP_ID } from './constants'
// import { AuthenticatorDevice } from '@simplewebauthn/typescript-types'

const loginApp = express()

loginApp.use(express.json())
loginApp.use(cors())

loginApp.get(
  ['/options', '/login/options'],
  async (req: express.Request, res: express.Response) => {
  const { email } = req.query

  // Validate parameters
  if (!email) {
    res.status(400).send({ error: 'Missing required parameters' })

    return
  }

  const userEmail = email as string

  // Check if user already registered on firebase
  const alreadyRegistered = await userEmailAlreadyRegistered(userEmail)

  if (!alreadyRegistered) {
    res.status(400).send({ error: `${userEmail} not registered!` })

    return
  }

  const userAuthenticators = await getAllUserAuthenticators(userEmail)

  try {
    const options = generateAuthenticationOptions({
      allowCredentials: userAuthenticators.map(auth => ({
        id: auth.credentialID,
        type: 'public-key',
      })),
      userVerification: 'preferred'
    })

    await saveChallenge(userEmail, options.challenge)

    res.send(options)
  }
  catch (error) {
    res.status(400).send(error)
  }
})

loginApp.post(
  ['/verify', '/login/verify'],
  async (req: express.Request, res: express.Response) => {
  const { email } = req.query

  // Validate parameters
  if (!email) {
    res.status(400).send({ error: 'Missing required parameters' })

    return
  }

  const userEmail = email as string

  try {
    const expectedChallenge = await getChallenge(userEmail)

    if (!expectedChallenge) {
      res.status(400).send({ error: 'Could not find challenge for user ' + userEmail })
  
      return
    }

    const { body } = req

    const authenticator = await getUserAuthenticator(userEmail, body.id)

    if (!authenticator) {
      res.status(400).send({ error: 'Could not find authenticator ' + body.id + ' for user ' + userEmail })
  
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
      console.log('error :(')
      throw Error('Error authenticating')
    }

    // TODO: Update authenticator counter on database

    // Retrieve token from firebase auth
    functions.logger.info('Will retrieve user custom token')
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