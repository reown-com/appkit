import { createActor } from 'xstate'

import { chainMachine } from './ChainMachine.js'
import ports from './ports.js'

export const chainActor = createActor(chainMachine, {
  input: {
    ports,
    namespaces: new Map(),
    activeChain: undefined,
    activeCaipNetwork: undefined,
    isSwitchingNamespace: false,
    lastConnectedSIWECaipNetwork: undefined,
    smartAccountEnabledNetworks: undefined,
    requestedCaipNetworks: []
  }
})
