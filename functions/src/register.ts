import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'
import { saveChallenge, getChallenge } from './data/challenge'
import { saveAuthenticator } from './data/authenticator'

import { ORIGIN, RP_ID, RP_NAME } from './constants'
import { AuthenticatorDevice } from '@simplewebauthn/typescript-types'

const registerApp = express()

registerApp.use(express.json())
registerApp.use(cors())

registerApp.get(
  ['/options', '/register/options'],
  async (req: express.Request, res: express.Response) => {
  const { id, name } = req.query

  console.log(req.url)

  // Validate parameters
  if (!id || !name) {
    res.status(400).send({ error: 'Missing required parameters' })

    return
  }

  const userID = id as string
  const userName = name as string

  try {
    const options = generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID,
      userName,
    })

    await saveChallenge(userID, options.challenge)

    res.send(options)
  }
  catch (error) {
    res.status(400).send(error)
  }
})

registerApp.post(
  ['/verify', '/register/verify'],
  async (req: express.Request, res: express.Response) => {
  const { id } = req.query

  // Validate parameters
  if (!id) {
    res.status(400).send({ error: 'Missing required parameters' })

    return
  }

  const userID = id as string

  try {
    const expectedChallenge = await getChallenge(userID)

    if (!expectedChallenge) {
      res.status(400).send({ error: 'Could not find challenge for user ' + userID })
  
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
      throw Error('Error registering')
    }

    const { credentialPublicKey, credentialID, counter } = registrationInfo;

    const newAuthenticator: AuthenticatorDevice = {
      credentialID,
      credentialPublicKey,
      counter,
    };

    await saveAuthenticator(userID, newAuthenticator)

    res.send(verification)
  }
  catch (error) {
    res.status(400).send(error)
  }
})

export const register = functions.https.onRequest(registerApp)