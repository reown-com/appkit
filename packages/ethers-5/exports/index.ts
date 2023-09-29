import type { Web3ModalOptions } from '../src/client.js'
import { Web3Modal } from '../src/client.js'
import { VERSION } from '../src/utils/constants.js'

export type { Web3ModalOptions } from '../src/client.js'
export { defaultEthersConfig } from '../src/utils/defaultEthersCoreConfig.js'

export function createWeb3Modal(options: Web3ModalOptions) {
  return new Web3Modal({ ...options, _sdkVersion: `html-ethers-5-${VERSION}` })
}
