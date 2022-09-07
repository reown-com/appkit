import type { ConnectorData } from '@wagmi/core'
import type { State } from '@wagmi/core/dist/declarations/src/client'
import { AccountCtrl } from '@web3modal/core'
import type { EthereumClient } from '../types/apiTypes'

export const NAMESPACE = 'eip155'

export let ethereumClient = undefined as EthereumClient | undefined

function onConnectorChange(event: ConnectorData) {
  if (event.account) AccountCtrl.setAddress(event.account)
  if (event.chain) AccountCtrl.setChainId(`${NAMESPACE}:${event.chain.id}`)
}

function onConnectorMessage(event: { type: string; data?: unknown }) {
  console.log(event)
}

function onConnectorError(event: Error) {
  console.log(event)
}

function onClientConnected() {
  const account = ethereumClient?.data?.account
  const chain = ethereumClient?.data?.chain
  const connector = ethereumClient?.connector
  const provider = ethereumClient?.provider
  if (account && chain && connector && provider) {
    connector.on('change', onConnectorChange)
    connector.on('message', onConnectorMessage)
    connector.on('error', onConnectorError)
    AccountCtrl.setAccount({
      address: account,
      chainId: `${NAMESPACE}:${chain.id}`,
      connector: connector.id
    })
  }
}

function onClientDisconnected() {
  ethereumClient?.connector?.removeAllListeners()
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
