import type { Client, ConnectorData } from '@wagmi/core'
import { chain as wagmiChain, configureChains, createClient } from '@wagmi/core'
import type { State } from '@wagmi/core/dist/declarations/src/client'
import { publicProvider } from '@wagmi/core/providers/public'
import { AccountCtrl } from '@web3modal/core'
import { Buffer } from 'buffer'
import type { EthereumOptions } from '../../types/apiTypes'
import { NAMESPACE } from './constants'
import { defaultConnectors } from './wagmiTools'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (typeof window !== 'undefined' && !window.Buffer) window.Buffer = Buffer

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client = undefined as Client<any, any> | undefined

export function getClient() {
  return client
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

export function initializeClient(options: EthereumOptions) {
  const configChains = options.chains ?? [wagmiChain.mainnet]
  const configProviders = options.providers ?? [publicProvider()]
  const configAutoConnect = options.autoConnect ?? true

  const { chains, provider } = configureChains(configChains, configProviders)

  const wagmiClient = createClient({
    autoConnect: configAutoConnect,
    connectors: defaultConnectors({ chains, appName: options.appName }),
    provider
  })

  client = wagmiClient
  getClient()?.subscribe(onClientChange)
}
