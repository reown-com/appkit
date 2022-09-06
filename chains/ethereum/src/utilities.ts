import type { State } from '@wagmi/core/dist/declarations/src/client'
import { AccountCtrl } from '@web3modal/core'
import type { EthereumClient } from '../types/apiTypes'

export const NAMESPACE = 'eip155'

export let ethereumClient = undefined as EthereumClient | undefined

function onClientConnected() {
  const account = ethereumClient?.data?.account
  const chain = ethereumClient?.data?.chain
  if (account && chain) AccountCtrl.setAccount(account, `${NAMESPACE}:${chain.id}`)
}

function onClientDisconnected() {
  AccountCtrl.resetAccount()
}

function onClientChange(state: State, prevState: State) {
  if (state.status !== prevState.status) {
    const { status } = state
    if (status === 'connected') onClientConnected()
    if (status === 'disconnected') onClientDisconnected()
  }
}

export function initClient(wagmiClient: EthereumClient) {
  ethereumClient = wagmiClient
  ethereumClient.subscribe(onClientChange)
}
