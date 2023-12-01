import type { Web3ModalOptions } from '@web3modal/connectors'
import { Web3Modal } from '@web3modal/connectors'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { ethereumHelpers } from '../utils/ethereumHelpers.js'

export type { Web3ModalOptions } from '@web3modal/connectors'
export { defaultConfig } from '@web3modal/connectors'

export function createWeb3Modal(options: Web3ModalOptions) {
  return new Web3Modal({
    ...options,
    _sdkVersion: `html-ethers5-${ConstantsUtil.VERSION}`,
    ethereumHelpers
  })
}
