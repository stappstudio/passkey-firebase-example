import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'
import { ORIGIN, RP_ID, RP_NAME } from './constants'

const registerApp = express()

registerApp.use(express.json())
registerApp.use(cors())

registerApp.get('/options', async (req: express.Request, res: express.Response) => {
  const { id, name } = req.query

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

    await admin.firestore().collection('challenges').doc(userID).set({
      challenge: options.challenge
    })

    res.send(options)
  }
  catch (error) {
    res.status(400).send(error)
  }
})

registerApp.post('/verify', async (req: express.Request, res: express.Response) => {
  const { id } = req.query

  // Validate parameters
  if (!id) {
    res.status(400).send({ error: 'Missing required parameters' })

    return
  }

  const userID = id as string

  try {
    const challengeDoc = await admin.firestore().collection('challenges').doc(userID).get()
    const expectedChallenge = challengeDoc.get('challenge')

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

    res.send(verification)
  }
  catch (error) {
    res.status(400).send(error)
  }
})

export const register = functions.https.onRequest(registerApp)