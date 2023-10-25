import type { SIWEConfig } from '@web3modal/core'
import { Web3ModalSIWEClient } from '../src/client.js'

export { Web3ModalSIWEClient }
export type { SIWEConfig }

export function createSIWEConfig(siweConfig: SIWEConfig) {
  return new Web3ModalSIWEClient(siweConfig)
}
