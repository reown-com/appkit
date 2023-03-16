import type { ClientCtrlState } from '../types/controllerTypes'

// -- initial state ------------------------------------------------ //
let client: ClientCtrlState['ethereumClient'] = undefined

// -- controller -- As function to enable correct ssr handling
export const ClientCtrl = {
  ethereumClient: undefined,

  setEthereumClient(ethereumClient: ClientCtrlState['ethereumClient']) {
    client = ethereumClient
  },

  client() {
    if (client) {
      return client
    }

    throw new Error('ClientCtrl has no client set')
  }
}
