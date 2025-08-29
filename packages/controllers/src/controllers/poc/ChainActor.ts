import { createActor } from 'xstate'

import { chainMachine } from './ChainMachine.js'
import ports from './ports.js'

export const chainActor = createActor(chainMachine, {
  input: {
    ports
  }
})
