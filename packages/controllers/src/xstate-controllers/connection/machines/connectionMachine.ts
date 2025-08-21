import { setup } from 'xstate'

import { OptionsController } from '../../../controllers/OptionsController.js'
import type { ConnectionContext, ConnectionEvent } from '../types/connectionTypes.js'

export const connectionMachine = setup({
  types: {
    context: {} as ConnectionContext,
    events: {} as ConnectionEvent
  },
  actors: {},
  guards: {
    isSiwxEnabled: () => Boolean(OptionsController.state.siwx)
  },
  actions: {}
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGMD2A7dZkBcCWGAdBHrGptjpAMQDCA8gHKMCitAKgPoBKLAigFUWAZXYBtAAwBdRKAAOqWHnwZZIAB6IAtABYAzACZCANgkSA7AE4dEgBwBWY4532ANCACeie7b2E9pno29ua2OuYS9gC+Ue7kWLgE6ITxlHjoUHRMrBycwgK0tCLCkjJIIApKKuhqmggGLoQSBubGtgamvg7G7l4IPn4BEkGRoeGRMXEYCdUp02kZWcxsXPmFxWIAjGXyispJtYgGIYQu5gGGlpZOV72Ixub2hJabDvZ2Bps+DZMgqYlEf74RYMZa5ABiAEEAJIAGQEvFKakq+1U5TqlkI7R0Bga5haAx0xj0dwQtgkOiam3MNPsOiuEks51+QKShAATmAAI4AVzgwKgkJ5OAAFmB0PhkABDarUSECdgACRYjHY0NokLVTE4kIACrruPQAGosAAiSPKKOqhwQxiZp1MROMm02lj0Lp0pLtfjtx0iOlsD2Mxh0LPmAOSnN5-PSguFYoleGlsvlSpVao1WsYPBYACkVmaLbsqgd0fcriYdMEdK7rs5SfTMbZaeTPg9QptQ7E-uHZgA3KUAGzwEBlsaFovFkrHGDlCuVqvVmuh2rWRWEJWkyL21rLCC+eie9gagba1MbXrdJksfrpgdaxLDFAjhAHw9HAonCenKfn6aXWacFCcIIiwRYVDupagHULqOIQoQBDSNZmEEBiknoVjwSEjybGY7Qek+MxskCNCmtCwigjk4hbpakFotB2jtBIzzWOE9iWBYLSRKSbpPNcNLmFWbptCEMTdugqAQHAaisvREElnJdRaIGtgsVWjwcfiERuJ4Rw3oQxy0jiNihDehFpEQJBkL2kDbgpNR7lorSDM0ejWEE1xMp6un9L4-iBMEYzaeZL6shkdmog5DEIAEzwSMYDRXElSWBqSAz+cMmwGFc1K5SFsxRnysCfvGU5JjOUXyZFNrmK8-iumEAafOEThpX5QwjCEYQRMY+Vsm+I5jhkX5lcmUFVbu0Uuq0WISJszq1g8eKXj6N72HoegWIerq9d2snJCREARZNGiIPNkSEI4KEbTe7pEqSzZ+Li7yRMcgbrdEYlAA */
  id: 'connection',
  initial: 'disconnected',
  context: {
    connections: {
      eip155: [],
      solana: [],
      bip122: [],
      polkadot: [],
      cosmos: [],
      sui: [],
      stacks: []
    },
    activeCaipNetworkId: null,
    networks: []
  },
  states: {
    disconnected: {
      on: {
        CONNECT_REQUEST: {
          target: 'connecting'
        }
      }
    },
    connecting: {
      on: {
        CONNECT_SUCCESS: [
          {
            target: 'requestingAuthentication',
            guard: 'isSiwxEnabled'
          },
          {
            target: 'connected'
          }
        ],
        CONNECT_FAILURE: {
          target: 'disconnected'
        }
      }
    },
    requestingAuthentication: {
      on: {
        AUTHENTICATION_APPROVED: {
          target: 'validatingAuthentication'
        },
        AUTHENTICATION_REJECTED: {
          target: 'disconnected'
        }
      }
    },
    validatingAuthentication: {
      on: {
        AUTHENTICATION_SUCCESS: {
          target: 'connected'
        },
        AUTHENTICATION_FAILURE: {
          target: 'disconnected'
        }
      }
    },
    connected: {
      on: {
        DISCONNECT: {
          target: 'disconnected'
        }
      }
    }
  }
})
