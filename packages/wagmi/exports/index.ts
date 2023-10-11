import type { Web3ModalOptions } from '../src/client.js'
import { Web3Modal } from '../src/client.js'
import { VERSION } from '@web3modal/utils'

export type { Web3ModalOptions } from '../src/client.js'
export { EIP6963Connector } from '../src/connectors/EIP6963Connector.js'
export { defaultWagmiConfig } from '../src/utils/defaultWagmiCoreConfig.js'
export { walletConnectProvider } from '../src/utils/provider.js'

export function createWeb3Modal(options: Web3ModalOptions) {
  return new Web3Modal({ ...options, _sdkVersion: `html-wagmi-${VERSION}` })
}
