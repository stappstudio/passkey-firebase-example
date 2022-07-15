import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'

import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { saveChallenge } from './data/challenge'
import { getUserAuthenticators } from './data/authenticator'

// import { ORIGIN, RP_ID, RP_NAME } from './constants'
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

  const userAuthenticators = await getUserAuthenticators(userID)

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

export const login = functions.https.onRequest(loginApp)