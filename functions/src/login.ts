import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server'
import { saveChallenge, getChallenge } from './data/challenge'
import { getAllUserAuthenticators, getUserAuthenticator } from './data/authenticator'

import { ORIGIN, RP_ID } from './constants'
// import { AuthenticatorDevice } from '@simplewebauthn/typescript-types'

const loginApp = express()

loginApp.use(express.json())
loginApp.use(cors())

loginApp.get('/options', async (req: express.Request, res: express.Response) => {
  const { id } = req.query

  // Validate parameters
  if (!id) {
    res.status(400).send({ error: 'Missing required parameters' })

    return
  }

  const userID = id as string

  const userAuthenticators = await getAllUserAuthenticators(userID)

  try {
    const options = generateAuthenticationOptions({
      allowCredentials: userAuthenticators.map(auth => ({
        id: auth.credentialID,
        type: 'public-key',
      })),
      userVerification: 'preferred'
    })

    await saveChallenge(userID, options.challenge)

    res.send(options)
  }
  catch (error) {
    res.status(400).send(error)
  }
})

loginApp.post('/verify', async (req: express.Request, res: express.Response) => {
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

    const { body } = req

    const authenticator = await getUserAuthenticator(userID, body.id)

    if (!authenticator) {
      res.status(400).send({ error: 'Could not find authenticator ' + body.id + ' for user ' + userID })
  
      return
    }

    console.log('authenticator ok')
    console.log(authenticator)

    const verification = verifyAuthenticationResponse({
      credential: req.body,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator
    })

    console.log('verified response')

    console.log(verification)
    console.log(verification.verified)

    const { authenticationInfo } = verification;

    if (!verification.verified || !authenticationInfo) {
      console.log('error :(')
      throw Error('Error authenticating')
    }

    // const { credentialPublicKey, credentialID, counter } = authenticationInfo;

    // const newAuthenticator: AuthenticatorDevice = {
    //   credentialID,
    //   credentialPublicKey,
    //   counter,
    // };

    // await saveAuthenticator(userID, newAuthenticator)

    res.send(verification)
  }
  catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})

export const login = functions.https.onRequest(loginApp)