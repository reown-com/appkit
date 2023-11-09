import type { SIWEConfig } from '@web3modal/core'
import { Web3ModalSIWEClient } from '../src/client.js'

export type { Web3ModalSIWEClient, SIWEConfig }

export function createSIWEConfig(siweConfig: SIWEConfig) {
  return new Web3ModalSIWEClient(siweConfig)
}
