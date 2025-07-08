/* eslint-disable func-style */
/* eslint-disable init-declarations */
import {
  ChainNotConfiguredError,
  type Connector,
  ProviderNotFoundError,
  createConnector
} from '@wagmi/core'
import { type UniversalProvider as UniversalProviderType } from '@walletconnect/universal-provider'
import {
  type AddEthereumChainParameter,
  type Address,
  type ProviderConnectInfo,
  type ProviderRpcError,
  type RpcError,
  SwitchChainError,
  UserRejectedRequestError,
  getAddress,
  numberToHex
} from 'viem'

import { WcHelpersUtil } from '@reown/appkit'
import type { AppKitOptions } from '@reown/appkit'
import type { AppKit } from '@reown/appkit'
import { ConstantsUtil } from '@reown/appkit-common'
import { ChainController, OptionsController, StorageUtil } from '@reown/appkit-controllers'

type UniversalConnector = Connector & {
  onDisplayUri(uri: string): void
  onSessionDelete(data: { topic: string }): void
}

export type AppKitOptionsParams = AppKitOptions & {
  isNewChainsStale?: boolean
}

walletConnect.type = 'walletConnect' as const

export function walletConnect(parameters: AppKitOptionsParams, appKit: AppKit) {
  const isNewChainsStale = parameters.isNewChainsStale ?? true
  type Provider = Awaited<ReturnType<(typeof UniversalProviderType)['init']>>
  type Properties = {
    // eslint-disable-next-line no-shadow
    connect(parameters?: { chainId?: number; pairingTopic?: string }): Promise<{
      accounts: readonly Address[]
      chainId: number
    }>
    getNamespaceChainsIds(): number[]
    getRequestedChainsIds(): Promise<number[]>
    isChainsStale(): Promise<boolean>
    onConnect(connectInfo: ProviderConnectInfo): void
    onDisplayUri(uri: string): void
    onSessionDelete(data: { topic: string }): void
    setRequestedChainsIds(chains: number[]): void
    requestedChainsStorageKey: `${string}.requestedChains`
  }
  type StorageItem = {
    [_ in Properties['requestedChainsStorageKey']]: number[]
  }

  let provider_: Provider | undefined

  let accountsChanged: UniversalConnector['onAccountsChanged'] | undefined
  let chainChanged: UniversalConnector['onChainChanged'] | undefined
  let connect: UniversalConnector['onConnect'] | undefined
  let displayUri: UniversalConnector['onDisplayUri'] | undefined
  let sessionDelete: UniversalConnector['onSessionDelete'] | undefined
  let disconnect: UniversalConnector['onDisconnect'] | undefined

  return createConnector<Provider, Properties, StorageItem>(config => ({
    id: 'walletConnect',
    name: 'WalletConnect',
    type: walletConnect.type,

    async setup() {
      const provider = await this.getProvider().catch(() => null)
      if (!provider) {
        return
      }
      if (!connect) {
        connect = this.onConnect.bind(this)
        provider.on('connect', connect)
      }
      if (!sessionDelete) {
        sessionDelete = this.onSessionDelete.bind(this)
        provider.on('session_delete', sessionDelete)
      }
    },

    async connect({ ...rest } = {}) {
      try {
        const caipNetworks = ChainController.getCaipNetworks()
        const provider = await this.getProvider()
        if (!provider) {
          throw new ProviderNotFoundError()
        }
        if (!displayUri) {
          displayUri = this.onDisplayUri
          provider.on('display_uri', displayUri)
        }

        const isChainsStale = await this.isChainsStale()
        // If there is an active session with stale chains, disconnect current session.
        if (provider.session && isChainsStale) {
          await provider.disconnect()
        }
        const universalProviderConfigOverride =
          OptionsController.state.universalProviderConfigOverride
        // If there isn't an active session or chains are stale, connect.
        if (!provider.session || isChainsStale) {
          const namespaces = WcHelpersUtil.createNamespaces(
            caipNetworks,
            universalProviderConfigOverride
          )
          await provider.connect({
            optionalNamespaces: namespaces,
            ...('pairingTopic' in rest ? { pairingTopic: rest.pairingTopic } : {})
          })

          this.setRequestedChainsIds(caipNetworks.map(x => Number(x.id)))
        }

        // If session exists and chains are authorized, enable provider for required chain
        const accounts = await this.getAccounts()

        /**
         * Check if the chain is supported by the wallet. If not default back to the first chain that is provided.
         */
        const requestChainId = await this.getChainId()
        const chains = provider.session?.namespaces?.['eip155']?.chains
        const isRequestedChainSupported = chains?.some(
          chain => Number(chain.split(':')[1]) === requestChainId
        )

        let currentChainId = 1
        if (isRequestedChainSupported) {
          currentChainId = requestChainId
        } else if (chains?.[0]) {
          currentChainId = Number(chains[0].split(':')[1])
        }

        if (displayUri) {
          provider.removeListener('display_uri', displayUri)
          displayUri = undefined
        }
        if (connect) {
          provider.removeListener('connect', connect)
          connect = undefined
        }
        if (!accountsChanged) {
          accountsChanged = this.onAccountsChanged.bind(this)
          provider.on('accountsChanged', accountsChanged)
        }
        if (!chainChanged) {
          chainChanged = this.onChainChanged.bind(this)
          provider.on('chainChanged', chainChanged)
        }
        if (!disconnect) {
          disconnect = this.onDisconnect.bind(this)
          provider.on('disconnect', disconnect)
        }
        if (!sessionDelete) {
          sessionDelete = this.onSessionDelete.bind(this)
          provider.on('session_delete', sessionDelete)
        }
        const defaultChain = universalProviderConfigOverride?.defaultChain
        provider.setDefaultChain(defaultChain ?? `eip155:${currentChainId}`)

        return { accounts, chainId: currentChainId }
      } catch (error) {
        if (
          // eslint-disable-next-line prefer-named-capture-group, require-unicode-regexp
          /(user rejected|connection request reset)/i.test((error as ProviderRpcError)?.message)
        ) {
          throw new UserRejectedRequestError(error as Error)
        }
        throw error
      }
    },
    async disconnect() {
      const provider = await this.getProvider()
      try {
        await provider?.disconnect()
      } catch (error) {
        // eslint-disable-next-line require-unicode-regexp
        if (!/No matching key/i.test((error as Error).message)) {
          throw error
        }
      } finally {
        if (chainChanged) {
          provider?.removeListener('chainChanged', chainChanged)
          chainChanged = undefined
        }
        if (disconnect) {
          provider?.removeListener('disconnect', disconnect)
          disconnect = undefined
        }
        if (!connect) {
          connect = this.onConnect.bind(this)
          provider?.on('connect', connect)
        }
        if (accountsChanged) {
          provider?.removeListener('accountsChanged', accountsChanged)
          accountsChanged = undefined
        }
        if (sessionDelete) {
          provider?.removeListener('session_delete', sessionDelete)
          sessionDelete = undefined
        }

        this.setRequestedChainsIds([])
      }
    },
    async getAccounts() {
      const provider = await this.getProvider()

      if (!provider?.session?.namespaces) {
        return []
      }

      const accountsList = provider?.session?.namespaces[ConstantsUtil.CHAIN.EVM]?.accounts

      const accounts = (accountsList?.map(account => account.split(':')[2]) ?? []) as Address[]

      const accountsAdded = new Set<`0x${string}`>()

      const deduplicatedAccounts = accounts.filter(account => {
        const lowerCasedAccount = account?.toLowerCase() as Lowercase<Address>

        if (accountsAdded.has(lowerCasedAccount)) {
          return false
        }

        accountsAdded.add(lowerCasedAccount)

        return true
      })

      return deduplicatedAccounts
    },
    async getProvider({ chainId } = {}) {
      if (!provider_) {
        provider_ = await appKit.getUniversalProvider()
        provider_?.events.setMaxListeners(Number.POSITIVE_INFINITY)
      }

      const activeNamespace = StorageUtil.getActiveNamespace()
      const currentChainId = appKit.getCaipNetwork()?.id

      if (chainId && currentChainId !== chainId && activeNamespace) {
        const storedCaipNetworkId = StorageUtil.getStoredActiveCaipNetworkId()
        const appKitCaipNetworks = activeNamespace ? appKit.getCaipNetworks(activeNamespace) : []
        const storedCaipNetwork = appKitCaipNetworks?.find(n => n.id === storedCaipNetworkId)

        if (storedCaipNetwork && storedCaipNetwork.chainNamespace === ConstantsUtil.CHAIN.EVM) {
          await this.switchChain?.({ chainId: Number(storedCaipNetwork.id) })
        }
      }

      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      return provider_ as Provider
    },
    async getChainId() {
      const chainId = appKit.getCaipNetwork(ConstantsUtil.CHAIN.EVM)?.id

      if (chainId) {
        return chainId as number
      }

      const provider = await this.getProvider()
      const chain = provider.session?.namespaces[ConstantsUtil.CHAIN.EVM]?.chains?.[0]

      const network = ChainController.getCaipNetworks().find(c => c.id === chain)

      return network?.id as number
    },
    async isAuthorized() {
      try {
        const [accounts, provider] = await Promise.all([this.getAccounts(), this.getProvider()])

        // If an account does not exist on the session, then the connector is unauthorized.
        if (!accounts.length) {
          return false
        }

        // If the chains are stale on the session, then the connector is unauthorized.
        const isChainsStale = await this.isChainsStale()

        if (isChainsStale && provider.session) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          await provider.disconnect().catch(() => {})

          return false
        }

        return true
      } catch {
        return false
      }
    },
    async switchChain({ addEthereumChainParameter, chainId }) {
      const provider = await this.getProvider()
      if (!provider) {
        throw new ProviderNotFoundError()
      }

      const chainToSwitch = ChainController.getCaipNetworks().find(x => x.id === chainId)

      if (!chainToSwitch) {
        throw new SwitchChainError(new ChainNotConfiguredError())
      }

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: numberToHex(chainId) }]
        })

        if (chainToSwitch?.caipNetworkId) {
          provider.setDefaultChain(chainToSwitch?.caipNetworkId as string)
        }
        config.emitter.emit('change', { chainId: Number(chainId) })

        const requestedChains = await this.getRequestedChainsIds()
        this.setRequestedChainsIds([...requestedChains, chainId])

        return { ...chainToSwitch, id: chainToSwitch.id as number }
      } catch (err) {
        const error = err as RpcError

        if (/(?:user rejected)/iu.test(error.message)) {
          throw new UserRejectedRequestError(error)
        }

        try {
          let blockExplorerUrls: string[] | undefined

          if (addEthereumChainParameter?.blockExplorerUrls) {
            blockExplorerUrls = addEthereumChainParameter.blockExplorerUrls
          } else {
            blockExplorerUrls = chainToSwitch.blockExplorers?.default.url
              ? [chainToSwitch.blockExplorers?.default.url]
              : []
          }

          // Use original rpc to prevent leaking project ID
          const rpcUrls = chainToSwitch.rpcUrls?.['chainDefault']?.http || []

          const addEthereumChain = {
            blockExplorerUrls,
            chainId: numberToHex(chainId),
            chainName: chainToSwitch.name,
            iconUrls: addEthereumChainParameter?.iconUrls,
            nativeCurrency: chainToSwitch.nativeCurrency,
            rpcUrls
          } satisfies AddEthereumChainParameter

          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [addEthereumChain]
          })

          const requestedChains = await this.getRequestedChainsIds()
          this.setRequestedChainsIds([...requestedChains, chainId])

          return { ...chainToSwitch, id: chainToSwitch.id as number }
        } catch (e) {
          throw new UserRejectedRequestError(e as Error)
        }
      }
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.onDisconnect()
      } else {
        config.emitter.emit('change', {
          accounts: accounts.map(x => getAddress(x))
        })
      }
    },
    onChainChanged(chain) {
      const chainId = Number(chain)

      config.emitter.emit('change', { chainId })
    },
    onConnect(_connectInfo) {
      this.setRequestedChainsIds(ChainController.getCaipNetworks().map(x => Number(x.id)))
    },
    async onDisconnect(_error) {
      this.setRequestedChainsIds([])
      config.emitter.emit('disconnect')

      const provider = await this.getProvider()
      if (accountsChanged) {
        provider.removeListener('accountsChanged', accountsChanged)
        accountsChanged = undefined
      }
      if (chainChanged) {
        provider.removeListener('chainChanged', chainChanged)
        chainChanged = undefined
      }
      if (disconnect) {
        provider.removeListener('disconnect', disconnect)
        disconnect = undefined
      }
      if (sessionDelete) {
        provider.removeListener('session_delete', sessionDelete)
        sessionDelete = undefined
      }
      if (!connect) {
        connect = this.onConnect.bind(this)
        provider.on('connect', connect)
      }
    },
    onDisplayUri(uri) {
      config.emitter.emit('message', { type: 'display_uri', data: uri })
    },
    onSessionDelete() {
      this.onDisconnect()
    },
    getNamespaceChainsIds() {
      if (!provider_?.session?.namespaces) {
        return []
      }

      const accounts = provider_?.session?.namespaces[ConstantsUtil.CHAIN.EVM]?.accounts

      // eslint-disable-next-line radix
      const chainIds = accounts?.map(account => Number.parseInt(account.split(':')[1] ?? '')) ?? []

      return chainIds
    },

    async getRequestedChainsIds() {
      const chainIds = (await config.storage?.getItem(this.requestedChainsStorageKey)) ?? []

      return [...new Set(chainIds)]
    },
    /**
     * Checks if the target chains match the chains that were
     * initially requested by the connector for the WalletConnect session.
     * If there is a mismatch, this means that the chains on the connector
     * are considered stale, and need to be revalidated at a later point (via
     * connection).
     *
     * There may be a scenario where a dapp adds a chain to the
     * connector later on, however, this chain will not have been approved or rejected
     * by the wallet. In this case, the chain is considered stale.
     */
    async isChainsStale() {
      if (!isNewChainsStale) {
        return false
      }

      const connectorChains = config.chains.map(x => x.id)

      const namespaceChains = this.getNamespaceChainsIds()

      if (namespaceChains.length && !namespaceChains.some(id => connectorChains.includes(id))) {
        return false
      }

      const requestedChains = await this.getRequestedChainsIds()

      return !connectorChains.every(id => requestedChains.includes(Number(id)))
    },
    async setRequestedChainsIds(chains) {
      await config.storage?.setItem(this.requestedChainsStorageKey, chains)
    },
    get requestedChainsStorageKey() {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      return `${this.id}.requestedChains` as Properties['requestedChainsStorageKey']
    }
  }))
}
