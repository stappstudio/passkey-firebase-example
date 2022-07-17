import * as functions from 'firebase-functions'

import { cleanAuthenticators } from './data/authenticator'
import { cleanChallenges } from './data/challenge'
import { cleanUsers } from './data/user'

// Since this is a test environment, we always delete everything at midnight UTC
export const cleanup = functions.pubsub.schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    await cleanAuthenticators()
    await cleanChallenges()
    await cleanUsers()
    return null;
  }
);