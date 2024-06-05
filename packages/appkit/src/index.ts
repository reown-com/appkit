import type { OptionsControllerState } from '@web3modal/core'
import { Appkit } from './client.js'

export function createAppkit(options: OptionsControllerState) {
  return new Appkit({ ...options })
}
