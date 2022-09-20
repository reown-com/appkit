import type { ConnectorData } from '@wagmi/core'
import type { State } from '@wagmi/core/dist/declarations/src/client'
import { AccountCtrl } from '@web3modal/core'
import type { EthereumClient } from '../types/apiTypes'

export const NAMESPACE = 'eip155'

let ethereumClient = undefined as EthereumClient | undefined

export function getClient() {
  return ethereumClient
}

function onConnectorChange(event: ConnectorData) {
  if (event.account) AccountCtrl.setAddress(event.account)
  if (event.chain) AccountCtrl.setChain(`${NAMESPACE}:${event.chain.id}`, !event.chain.unsupported)
}

function onConnectorMessage(event: { type: string; data?: unknown }) {
  // eslint-disable-next-line no-console
  console.log(event)
}

function onConnectorError(event: Error) {
  // eslint-disable-next-line no-console
  console.log(event)
}

function onClientConnected() {
  const account = getClient()?.data?.account
  const chain = getClient()?.data?.chain
  const connector = getClient()?.connector
  const provider = getClient()?.provider
  if (account && chain && connector && provider) {
    connector.on('change', onConnectorChange)
    connector.on('message', onConnectorMessage)
    connector.on('error', onConnectorError)
    AccountCtrl.setAccount({
      address: account,
      chainId: `${NAMESPACE}:${chain.id}`,
      chainSupported: !chain.unsupported,
      connector: connector.id
    })
  }
}

function onClientDisconnected() {
  getClient()?.connector?.removeAllListeners()
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
  getClient()?.subscribe(onClientChange)
}

export function getChainIdReference(chainId: string): number {
  if (typeof chainId === 'string' && chainId.includes(':')) {
    const id = Number(chainId.split(':')[1])

    return id
  }

  throw new Error('Invalid chainId, should be formated as namespace:id')
}

export function formatOpts<T>(opts: T & { chainId: string }): T & { chainId: number } {
  return {
    ...opts,
    chainId: getChainIdReference(opts.chainId)
  }
}
