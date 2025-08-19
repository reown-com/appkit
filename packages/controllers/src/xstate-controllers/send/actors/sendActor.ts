import { createBrowserInspector } from '@statelyai/inspect'
import { createActor } from 'xstate'
import type { ActorRefFrom } from 'xstate'

import { sendMachine } from '../machines/sendMachine.js'

const { inspect } = createBrowserInspector()

// Create and start the send actor
export const sendActor = createActor(sendMachine, {
  // Optional: Initialize with data from storage or props
  input: {},
  inspect
})

// Start the actor
sendActor.start()

// Export typed actor reference
export type SendActorRef = ActorRefFrom<typeof sendMachine>
