import type { Client, ConnectorData } from '@wagmi/core'
import { chain as wagmiChain, configureChains, createClient, watchAccount } from '@wagmi/core'
import type { State } from '@wagmi/core/dist/declarations/src/client'
import { publicProvider } from '@wagmi/core/providers/public'
import { AccountCtrl } from '@web3modal/core'
import { Buffer } from 'buffer'
import type { EthereumOptions } from '../../types/apiTypes'
import { defaultConnectors } from './wagmiTools'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (typeof window !== 'undefined' && !window.Buffer) window.Buffer = Buffer

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client = undefined as Client<any, any> | undefined

export function getClient() {
  return client
}

export function initializeWatchers() {
  watchAccount(({ address, connector }) =>
    AccountCtrl.setAccount({
      address,
      connector
    })
  )
}

function onConnectorChange(event: ConnectorData) {
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
  const account = getClient()?.data?.account
  const chain = getClient()?.data?.chain
  const connector = getClient()?.connector
  const provider = getClient()?.provider
  if (account && chain && connector && provider) {
    connector.on('change', onConnectorChange)
    connector.on('message', onConnectorMessage)
    connector.on('error', onConnectorError)
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

  initializeWatchers()
}
