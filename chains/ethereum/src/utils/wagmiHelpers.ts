import type * as WagmiTypes from '@wagmi/core'
import * as WagmiCore from '@wagmi/core'
import type { State } from '@wagmi/core/dist/declarations/src/client'
import { publicProvider } from '@wagmi/core/providers/public'
import { Buffer } from 'buffer'
import type { EthereumOptions } from '../../types/apiTypes'
import { defaultConnectors } from './wagmiTools'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (typeof window !== 'undefined' && !window.Buffer) window.Buffer = Buffer

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client = undefined as WagmiTypes.Client<any, any> | undefined

export function getClient() {
  return client
}

function onConnectorChange(event: WagmiTypes.ConnectorData) {
  if (event.chain) {
    /* TODO: Set this in NetworkCtrl*/
  }
}

function onConnectorMessage(event: { type: string; data?: unknown }) {
  // TODO: Set this in ConnectorCtrl
}

function onConnectorError(event: Error) {
  // TODO: Handle this in ConnectorCtrl
}

function onClientConnected() {
  const connector = getClient()?.connector
  const provider = getClient()?.provider
  if (connector && provider) {
    connector.on('change', onConnectorChange)
    connector.on('message', onConnectorMessage)
    connector.on('error', onConnectorError)
  }
}

function onClientDisconnected() {
  getClient()?.connector?.removeAllListeners()
}

function onClientChange(state: State, prevState: State) {
  if (state.status !== prevState.status) {
    const { status } = state
    if (status === 'connected') onClientConnected()
    if (status === 'disconnected') onClientDisconnected()
  }
}

export function initializeClient(options: EthereumOptions) {
  const configChains = options.chains ?? [WagmiCore.chain.mainnet]
  const configProviders = options.providers ?? [publicProvider()]
  const configAutoConnect = options.autoConnect ?? true

  const { chains, provider, webSocketProvider } = WagmiCore.configureChains(
    configChains,
    configProviders
  )

  const wagmiClient = WagmiCore.createClient({
    autoConnect: configAutoConnect,
    connectors: defaultConnectors({ chains, appName: options.appName }),
    provider,
    webSocketProvider
  })

  client = wagmiClient
  getClient()?.subscribe(onClientChange)
}
