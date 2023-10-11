import type { Address, Chain, Config, WindowProvider } from '@wagmi/core'
import {
  connect,
  disconnect,
  fetchBalance,
  fetchEnsAvatar,
  fetchEnsName,
  getAccount,
  getNetwork,
  switchNetwork,
  watchAccount,
  watchNetwork
} from '@wagmi/core'
import { mainnet } from '@wagmi/core/chains'
import type {
  CaipAddress,
  CaipNetwork,
  CaipNetworkId,
  ConnectionControllerClient,
  Connector,
  LibraryOptions,
  NetworkControllerClient,
  PublicStateControllerState,
  Token
} from '@web3modal/scaffold'
import { Web3ModalScaffold } from '@web3modal/scaffold'
import type { EIP6963Connector } from './connectors/EIP6963Connector.js'
import {
  ADD_CHAIN_METHOD,
  EIP6963_ANNOUNCE_EVENT,
  EIP6963_CONNECTOR_ID,
  EIP6963_REQUEST_EVENT,
  NAMESPACE,
  VERSION,
  WALLET_CHOICE_KEY,
  WALLET_CONNECT_CONNECTOR_ID,
  ConnectorExplorerIds,
  ConnectorImageIds,
  ConnectorNamesMap,
  ConnectorTypesMap,
  NetworkImageIds
} from '@web3modal/utils'
import { caipNetworkIdToNumber, getWagmiCaipDefaultChain, getCaipTokens } from '@web3modal/utils'
// -- Types ---------------------------------------------------------------------
export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wagmiConfig: Config<any, any>
  chains?: Chain[]
  defaultChain?: Chain
  chainImages?: Record<number, string>
  connectorImages?: Record<string, string>
  tokens?: Record<number, Token>
}

export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion'>

declare global {
  interface Window {
    ethereum?: Record<string, unknown>
  }
}

// @ts-expect-error: Overriden state type is correct
interface Web3ModalState extends PublicStateControllerState {
  selectedNetworkId: number | undefined
}

interface Info {
  uuid: string
  name: string
  icon: string
  rdns: string
}

interface Wallet {
  info: Info
  provider: WindowProvider
}

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  private hasSyncedConnectedAccount = false

  private options: Web3ModalClientOptions | undefined = undefined

  public constructor(options: Web3ModalClientOptions) {
    const { wagmiConfig, chains, defaultChain, tokens, _sdkVersion, ...w3mOptions } = options

    if (!wagmiConfig) {
      throw new Error('web3modal:constructor - wagmiConfig is undefined')
    }

    if (!w3mOptions.projectId) {
      throw new Error('web3modal:constructor - projectId is undefined')
    }

    if (!wagmiConfig.connectors.find(c => c.id === WALLET_CONNECT_CONNECTOR_ID)) {
      throw new Error('web3modal:constructor - WalletConnectConnector is required')
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = caipNetworkIdToNumber(caipNetwork?.id)
        if (chainId) {
          await switchNetwork({ chainId })
        }
      },

      async getApprovedCaipNetworksData() {
        const walletChoice = localStorage.getItem(WALLET_CHOICE_KEY)
        if (walletChoice?.includes(WALLET_CONNECT_CONNECTOR_ID)) {
          const connector = wagmiConfig.connectors.find(c => c.id === WALLET_CONNECT_CONNECTOR_ID)
          if (!connector) {
            throw new Error(
              'networkControllerClient:getApprovedCaipNetworks - connector is undefined'
            )
          }
          const provider = await connector.getProvider()
          const ns = provider.signer?.session?.namespaces
          const nsMethods = ns?.[NAMESPACE]?.methods
          const nsChains = ns?.[NAMESPACE]?.chains

          return {
            supportsAllNetworks: nsMethods?.includes(ADD_CHAIN_METHOD),
            approvedCaipNetworkIds: nsChains as CaipNetworkId[]
          }
        }

        return { approvedCaipNetworkIds: undefined, supportsAllNetworks: true }
      }
    }

    const connectionControllerClient: ConnectionControllerClient = {
      connectWalletConnect: async onUri => {
        const connector = wagmiConfig.connectors.find(c => c.id === WALLET_CONNECT_CONNECTOR_ID)
        if (!connector) {
          throw new Error('connectionControllerClient:getWalletConnectUri - connector is undefined')
        }

        connector.on('message', event => {
          if (event.type === 'display_uri') {
            onUri(event.data as string)
            connector.removeAllListeners()
          }
        })

        const chainId = caipNetworkIdToNumber(this.getCaipNetwork()?.id)

        await connect({ connector, chainId })
      },

      connectExternal: async ({ id, provider, info }) => {
        const connector = wagmiConfig.connectors.find(c => c.id === id)
        if (!connector) {
          throw new Error('connectionControllerClient:connectExternal - connector is undefined')
        }
        if (provider && info && connector.id === EIP6963_CONNECTOR_ID) {
          // @ts-expect-error Exists on EIP6963Connector
          connector.setEip6963Wallet?.({ provider, info })
        }
        const chainId = caipNetworkIdToNumber(this.getCaipNetwork()?.id)

        await connect({ connector, chainId })
      },

      checkInstalled: ids => {
        const eip6963Connectors = this.getConnectors().filter(c => c.type === 'ANNOUNCED')
        const injectedConnector = this.getConnectors().find(c => c.type === 'INJECTED')

        if (!ids) {
          return Boolean(window.ethereum)
        }

        if (eip6963Connectors.length) {
          const installed = ids.some(id => eip6963Connectors.some(c => c.info?.rdns === id))
          if (installed) {
            return true
          }
        }

        if (injectedConnector) {
          if (!window?.ethereum) {
            return false
          }

          return ids.some(id => Boolean(window.ethereum?.[String(id)]))
        }

        return false
      },

      disconnect
    }

    super({
      networkControllerClient,
      connectionControllerClient,
      defaultChain: getWagmiCaipDefaultChain(defaultChain),
      tokens: getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `html-wagmi-${VERSION}`,
      ...w3mOptions
    })

    this.options = options

    this.syncRequestedNetworks(chains)

    this.syncConnectors(wagmiConfig)
    this.listenConnectors(wagmiConfig)

    watchAccount(() => this.syncAccount())
    watchNetwork(() => this.syncNetwork())
  }

  // -- Public ------------------------------------------------------------------

  // @ts-expect-error: Overriden state type is correct
  public override getState() {
    const state = super.getState()

    return {
      ...state,
      selectedNetworkId: caipNetworkIdToNumber(state.selectedNetworkId)
    }
  }

  // @ts-expect-error: Overriden state type is correct
  public override subscribeState(callback: (state: Web3ModalState) => void) {
    return super.subscribeState(state =>
      callback({
        ...state,
        selectedNetworkId: caipNetworkIdToNumber(state.selectedNetworkId)
      })
    )
  }

  // -- Private -----------------------------------------------------------------
  private syncRequestedNetworks(chains: Web3ModalClientOptions['chains']) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `${NAMESPACE}:${chain.id}`,
          name: chain.name,
          imageId: NetworkImageIds[chain.id],
          imageUrl: this.options?.chainImages?.[chain.id]
        }) as CaipNetwork
    )
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? [])
  }

  private async syncAccount() {
    const { address, isConnected } = getAccount()
    const { chain } = getNetwork()
    this.resetAccount()
    if (isConnected && address && chain) {
      const caipAddress: CaipAddress = `${NAMESPACE}:${chain.id}:${address}`
      this.setIsConnected(isConnected)
      this.setCaipAddress(caipAddress)
      await Promise.all([
        this.syncProfile(address),
        this.syncBalance(address, chain),
        this.getApprovedCaipNetworksData()
      ])
      this.hasSyncedConnectedAccount = true
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.resetWcConnection()
      this.resetNetwork()
    }
  }

  private async syncNetwork() {
    const { address, isConnected } = getAccount()
    const { chain } = getNetwork()

    if (chain) {
      const chainId = String(chain.id)
      const caipChainId: CaipNetworkId = `${NAMESPACE}:${chainId}`
      this.setCaipNetwork({
        id: caipChainId,
        name: chain.name,
        imageId: NetworkImageIds[chain.id],
        imageUrl: this.options?.chainImages?.[chain.id]
      })
      if (isConnected && address) {
        const caipAddress: CaipAddress = `${NAMESPACE}:${chain.id}:${address}`
        this.setCaipAddress(caipAddress)
        if (chain.blockExplorers?.default?.url) {
          const url = `${chain.blockExplorers.default.url}/address/${address}`
          this.setAddressExplorerUrl(url)
        } else {
          this.setAddressExplorerUrl(undefined)
        }
        if (this.hasSyncedConnectedAccount) {
          await this.syncBalance(address, chain)
        }
      }
    }
  }

  private async syncProfile(address: Address) {
    try {
      const { name, avatar } = await this.fetchIdentity({
        caipChainId: `${NAMESPACE}:${mainnet.id}`,
        address
      })
      this.setProfileName(name)
      this.setProfileImage(avatar)
    } catch {
      const profileName = await fetchEnsName({ address, chainId: mainnet.id })
      if (profileName) {
        this.setProfileName(profileName)
        const profileImage = await fetchEnsAvatar({ name: profileName, chainId: mainnet.id })
        if (profileImage) {
          this.setProfileImage(profileImage)
        }
      }
    }
  }

  private async syncBalance(address: Address, chain: Chain) {
    const balance = await fetchBalance({
      address,
      chainId: chain.id,
      token: this.options?.tokens?.[chain.id]?.address as Address
    })
    this.setBalance(balance.formatted, balance.symbol)
  }

  private syncConnectors(wagmiConfig: Web3ModalClientOptions['wagmiConfig']) {
    const w3mConnectors: Connector[] = []
    wagmiConfig.connectors.forEach(({ id, name }) => {
      if (id !== EIP6963_CONNECTOR_ID) {
        w3mConnectors.push({
          id,
          explorerId: ConnectorExplorerIds[id],
          imageId: ConnectorImageIds[id],
          imageUrl: this.options?.connectorImages?.[id],
          name: ConnectorNamesMap[id] ?? name,
          type: ConnectorTypesMap[id] ?? 'EXTERNAL'
        })
      }
    })
    this.setConnectors(w3mConnectors)
  }

  private listenConnectors(wagmiConfig: Web3ModalClientOptions['wagmiConfig']) {
    const connector = wagmiConfig.connectors.find(
      c => c.id === EIP6963_CONNECTOR_ID
    ) as EIP6963Connector

    if (typeof window !== 'undefined' && connector) {
      window.addEventListener(EIP6963_ANNOUNCE_EVENT, (event: CustomEventInit<Wallet>) => {
        if (event.detail) {
          const { info, provider } = event.detail
          this.addConnector({
            id: EIP6963_CONNECTOR_ID,
            type: 'ANNOUNCED',
            imageUrl: info.icon ?? this.options?.connectorImages?.[EIP6963_CONNECTOR_ID],
            name: info.name,
            provider,
            info
          })
          connector.isAuthorized({ info, provider })
        }
      })
      window.dispatchEvent(new Event(EIP6963_REQUEST_EVENT))
    }
  }
}
