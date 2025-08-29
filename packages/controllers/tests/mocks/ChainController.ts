import { ChainController } from '../../exports/index.js'

export function mockChainControllerState() {
  ChainController.getSnapshot().context.namespaces = new Map()
  ChainController.getSnapshot().context.activeChain = undefined
}

export function mockResetChainControllerState() {
  ChainController.getSnapshot().context.namespaces = new Map()
  ChainController.getSnapshot().context.activeChain = undefined
}
