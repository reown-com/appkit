import type { Address, Chain, Config } from '@wagmi/core'
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
  NetworkControllerClient,
  ProjectId,
  SdkVersion
} from '@web3modal/scaffold'
import { Web3ModalScaffold } from '@web3modal/scaffold'
import {
  ADD_CHAIN_METHOD,
  INJECTED_ID,
  NAMESPACE,
  NAME_MAP,
  TYPE_MAP,
  VERSION,
  WALLET_CHOICE_KEY,
  WALLET_CONNECT_ID
} from './utils/constants.js'
import { NetworkImageIds } from './utils/presets.js'

// -- Types ---------------------------------------------------------------------
export interface Web3ModalOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wagmiConfig: Config<any, any>
  projectId: ProjectId
  chains?: Chain[]
  _sdkVersion?: SdkVersion
}

declare global {
  interface Window {
    ethereum?: Record<string, unknown>
  }
}

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  public constructor(options: Web3ModalOptions) {
    const { wagmiConfig, projectId, chains, _sdkVersion } = options

    if (!wagmiConfig) {
      throw new Error('web3modal:constructor - wagmiConfig is undefined')
    }

    if (!projectId) {
      throw new Error('web3modal:constructor - projectId is undefined')
    }

    if (!wagmiConfig.connectors.find(c => c.id === WALLET_CONNECT_ID)) {
      throw new Error('web3modal:constructor - WalletConnectConnector is required')
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = this.caipNetworkIdToNumber(caipNetwork?.id)
        if (chainId) {
          await switchNetwork({ chainId })
        }
      },

      async getApprovedCaipNetworksData() {
        const walletChoice = localStorage.getItem(WALLET_CHOICE_KEY)
        if (walletChoice?.includes(WALLET_CONNECT_ID)) {
          const connector = wagmiConfig.connectors.find(c => c.id === WALLET_CONNECT_ID)
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
        const connector = wagmiConfig.connectors.find(c => c.id === WALLET_CONNECT_ID)
        if (!connector) {
          throw new Error('connectionControllerClient:getWalletConnectUri - connector is undefined')
        }

        connector.on('message', event => {
          if (event.type === 'display_uri') {
            onUri(event.data as string)
            connector.removeAllListeners()
          }
        })

        const chainId = this.caipNetworkIdToNumber(this.getCaipNetwork()?.id)

        await connect({ connector, chainId })
      },

      connectExternal: async id => {
        const connector = wagmiConfig.connectors.find(c => c.id === id)
        if (!connector) {
          throw new Error('connectionControllerClient:connectExternal - connector is undefined')
        }

        const chainId = this.caipNetworkIdToNumber(this.getCaipNetwork()?.id)

        await connect({ connector, chainId })
      },

      connectInjected: async () => {
        const connector = wagmiConfig.connectors.find(c => c.id === INJECTED_ID)
        if (!connector) {
          throw new Error('connectionControllerClient:connectInjected - connector is undefined')
        }

        const chainId = this.caipNetworkIdToNumber(this.getCaipNetwork()?.id)

        await connect({ connector, chainId })
      },

      checkInjectedInstalled(ids) {
        if (!window?.ethereum) {
          return false
        }

        if (!ids) {
          return Boolean(window.ethereum)
        }

        return ids.some(id => Boolean(window.ethereum?.[String(id)]))
      },

      disconnect
    }

    super({
      networkControllerClient,
      connectionControllerClient,
      projectId,
      sdkVersion: _sdkVersion ?? `html-wagmi-${VERSION}`
    })

    this.syncRequestedNetworks(chains)

    this.syncConnectors(wagmiConfig.connectors)

    watchAccount(() => this.syncAccount())

    watchNetwork(() => this.syncNetwork())
  }

  // -- Private -----------------------------------------------------------------
  private syncRequestedNetworks(chains: Web3ModalOptions['chains']) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `${NAMESPACE}:${chain.id}`,
          name: chain.name,
          imageId: NetworkImageIds[chain.id]
        }) as CaipNetwork
    )
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? [])
  }

  private async syncAccount() {
    const { address, isConnected } = getAccount()
    const { chain } = getNetwork()
    this.resetAccount()
    if (isConnected && address && chain) {
      this.resetWcConnection()
      const caipAddress: CaipAddress = `${NAMESPACE}:${chain.id}:${address}`
      this.setIsConnected(isConnected)
      this.setCaipAddress(caipAddress)
      await Promise.all([
        this.syncProfile(address),
        this.syncBalance(address, chain),
        this.getApprovedCaipNetworksData()
      ])
    } else if (!isConnected) {
      this.resetNetwork()
    }
  }

  private async syncNetwork() {
    const { address, isConnected } = getAccount()
    const { chain } = getNetwork()
    if (chain) {
      const chainId = String(chain.id)
      const caipChainId: CaipNetworkId = `${NAMESPACE}:${chainId}`
      this.setCaipNetwork({ id: caipChainId, name: chain.name, imageId: NetworkImageIds[chain.id] })
      if (isConnected && address) {
        const caipAddress: CaipAddress = `${NAMESPACE}:${chain.id}:${address}`
        this.setCaipAddress(caipAddress)
        await this.syncBalance(address, chain)
      }
    }
  }

  private async syncProfile(address: Address) {
    const profileName = await fetchEnsName({ address, chainId: mainnet.id })
    if (profileName) {
      this.setProfileName(profileName)
      const profileImage = await fetchEnsAvatar({ name: profileName, chainId: mainnet.id })
      if (profileImage) {
        this.setProfileImage(profileImage)
      }
    }
  }

  private async syncBalance(address: Address, chain: Chain) {
    const balance = await fetchBalance({ address, chainId: chain.id })
    this.setBalance(balance.formatted, balance.symbol)
  }

  private syncConnectors(connectors: Web3ModalOptions['wagmiConfig']['connectors']) {
    const w3mConnectors = connectors.map(
      connector =>
        ({
          id: connector.id,
          name: NAME_MAP[connector.id] ?? connector.name,
          type: TYPE_MAP[connector.id] ?? 'EXTERNAL'
        }) as const
    )
    this.setConnectors(w3mConnectors ?? [])
  }

  private caipNetworkIdToNumber(caipnetworkId?: CaipNetworkId) {
    return caipnetworkId ? Number(caipnetworkId.split(':')[1]) : undefined
  }
}
