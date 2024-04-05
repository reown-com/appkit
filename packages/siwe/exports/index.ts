import type {
  SIWEConfig,
  SIWESession,
  SIWECreateMessageArgs,
  SIWEVerifyMessageArgs,
  SIWEClientMethods
} from '../core/utils/TypeUtils.js'
import { Web3ModalSIWEClient } from '../src/client.js'
import { SIWEController, type SIWEControllerClient } from '../core/controller/SIWEController.js'
import { PluginsController } from '@web3modal/core'
import type { W3mConnectingSiweView } from './index.js'
import type { W3mConnectingSiwe } from './index.js'
export { SIWEController }

export type SIWEPlugin = typeof SIWEController & {
  scaffold: {
    connectingSIWE: W3mConnectingSiwe
    connectingSIWEView: W3mConnectingSiweView
  }
}

export type {
  Web3ModalSIWEClient,
  SIWEConfig,
  SIWESession,
  SIWECreateMessageArgs,
  SIWEVerifyMessageArgs,
  SIWEClientMethods,
  SIWEControllerClient
}

export function createSIWEConfig(siweConfig: SIWEConfig) {
  return new Web3ModalSIWEClient(siweConfig)
}

export * from '../scaffold/partials/w3m-connecting-siwe/index.js'
export * from '../scaffold/views/w3m-connecting-siwe-view/index.js'

PluginsController.initSIWE({
  ...SIWEController,
  scaffold: {
    connectingSIWE: document.createElement('w3m-connecting-siwe'),
    connectingSIWEView: document.createElement('w3m-connecting-siwe-view')
  }
})
