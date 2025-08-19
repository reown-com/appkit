// Convenience API for simple usage
import { sendActor as actor } from './actors/sendActor.js'

// Main exports for the XState SendController
export { sendActor } from './actors/sendActor.js'
export type { SendActorRef } from './actors/sendActor.js'

// Types
export type {
  SendContext,
  SendEvent,
  SendMachine,
  BalanceFetchInput,
  ENSResolutionInput,
  ENSResolutionOutput,
  TransactionInput,
  TransactionOutput
} from './types/sendTypes.js'

// Machine definition (for testing or advanced usage)
export { sendMachine } from './machines/sendMachine.js'

// Convenience wrapper with bound methods
export const SendState = {
  subscribe: actor.subscribe.bind(actor),
  send: actor.send.bind(actor),
  getSnapshot: actor.getSnapshot.bind(actor),
  start: actor.start.bind(actor),
  stop: actor.stop.bind(actor)
}
