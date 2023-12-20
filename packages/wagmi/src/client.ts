import { type Hex, type Chain } from 'viem'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { mainnet } from 'viem/chains'
import {
  connect,
  disconnect,
  signMessage,
  getBalance,
  getEnsAvatar,
  getEnsName,
  getAccount,
  switchChain,
  watchAccount,
  type Config,
  type GetAccountReturnType
} from '@wagmi/core'
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
import type { Web3ModalSIWEClient } from '@web3modal/siwe'
import { ConstantsUtil, PresetsUtil, HelpersUtil } from '@web3modal/scaffold-utils'
import { getCaipDefaultChain } from './utils/helpers.js'
import { WALLET_CHOICE_KEY } from './utils/constants.js'
import type { W3mFrameProvider } from '@web3modal/wallet'

// -- Types ---------------------------------------------------------------------
export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wagmiConfig: Config<any, any>
  siweConfig?: Web3ModalSIWEClient
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

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  private hasSyncedConnectedAccount = false

  private options: Web3ModalClientOptions | undefined = undefined

  private wagmiConfig: Web3ModalClientOptions['wagmiConfig']

  public constructor(options: Web3ModalClientOptions) {
    const { wagmiConfig, siweConfig, chains, defaultChain, tokens, _sdkVersion, ...w3mOptions } =
      options

    if (!wagmiConfig) {
      throw new Error('web3modal:constructor - wagmiConfig is undefined')
    }

    if (!w3mOptions.projectId) {
      throw new Error('web3modal:constructor - projectId is undefined')
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = HelpersUtil.caipNetworkIdToNumber(caipNetwork?.id)
        if (chainId) {
          await switchChain(this.wagmiConfig, { chainId })
        }
      },

      async getApprovedCaipNetworksData() {
        const walletChoice = localStorage.getItem(WALLET_CHOICE_KEY)
        if (walletChoice?.includes(ConstantsUtil.EMAIL_CONNECTOR_ID)) {
          return {
            supportsAllNetworks: false,
            approvedCaipNetworkIds: PresetsUtil.WalletConnectRpcChainIds.map(
              id => `${ConstantsUtil.EIP155}:${id}`
            ) as CaipNetworkId[]
          }
        } else if (walletChoice?.includes(ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID)) {
          const connector = wagmiConfig.connectors.find(
            c => c.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
          )
          if (!connector) {
            throw new Error(
              'networkControllerClient:getApprovedCaipNetworks - connector is undefined'
            )
          }
          const provider = (await connector.getProvider()) as Awaited<
            ReturnType<(typeof EthereumProvider)['init']>
          >
          const ns = provider?.signer?.session?.namespaces
          const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods
          const nsChains = ns?.[ConstantsUtil.EIP155]?.chains as CaipNetworkId[]

          return {
            supportsAllNetworks: Boolean(nsMethods?.includes(ConstantsUtil.ADD_CHAIN_METHOD)),
            approvedCaipNetworkIds: nsChains
          }
        }

        return { approvedCaipNetworkIds: undefined, supportsAllNetworks: true }
      }
    }

    const connectionControllerClient: ConnectionControllerClient = {
      connectWalletConnect: async onUri => {
        const connector = wagmiConfig.connectors.find(
          c => c.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
        )
        if (!connector) {
          throw new Error('connectionControllerClient:getWalletConnectUri - connector is undefined')
        }
        const provider = (await connector.getProvider()) as Awaited<
          ReturnType<(typeof EthereumProvider)['init']>
        >

        provider.on('display_uri', data => {
          onUri(data)
        })

        const chainId = HelpersUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id)

        await connect(this.wagmiConfig, { connector, chainId })
      },

      connectExternal: async ({ id, provider, info }) => {
        const connector = wagmiConfig.connectors.find(c => c.id === id)
        if (!connector) {
          throw new Error('connectionControllerClient:connectExternal - connector is undefined')
        }
        if (provider && info && connector.id === ConstantsUtil.EIP6963_CONNECTOR_ID) {
          // @ts-expect-error Exists on EIP6963Connector
          connector.setEip6963Wallet?.({ provider, info })
        }
        const chainId = HelpersUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id)

        await connect(this.wagmiConfig, { connector, chainId })
      },

      checkInstalled: ids => {
        const injectedConnector = this.getConnectors().find(c => c.type === 'INJECTED')

        if (!ids) {
          return Boolean(window.ethereum)
        }

        if (injectedConnector) {
          if (!window?.ethereum) {
            return false
          }

          return ids.some(id => Boolean(window.ethereum?.[String(id)]))
        }

        return false
      },

      disconnect: async () => {
        await disconnect(this.wagmiConfig)
        if (siweConfig?.options?.signOutOnDisconnect) {
          await siweConfig.signOut()
        }
      },

      signMessage: async message => signMessage(this.wagmiConfig, { message })
    }

    super({
      networkControllerClient,
      connectionControllerClient,
      siweControllerClient: siweConfig,
      defaultChain: getCaipDefaultChain(defaultChain),
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `html-wagmi-${ConstantsUtil.VERSION}`,
      ...w3mOptions
    })

    this.options = options
    this.wagmiConfig = wagmiConfig

    this.syncRequestedNetworks(chains)

    this.syncConnectors(wagmiConfig)
    this.syncEmailConnector(wagmiConfig)
    this.listenEmailConnector(wagmiConfig)

    watchAccount(this.wagmiConfig, {
      onChange: accountData => this.syncAccount({ ...accountData, config: wagmiConfig })
    })
  }

  // -- Public ------------------------------------------------------------------

  // @ts-expect-error: Overriden state type is correct
  public override getState() {
    const state = super.getState()

    return {
      ...state,
      selectedNetworkId: HelpersUtil.caipNetworkIdToNumber(state.selectedNetworkId)
    }
  }

  // @ts-expect-error: Overriden state type is correct
  public override subscribeState(callback: (state: Web3ModalState) => void) {
    return super.subscribeState(state =>
      callback({
        ...state,
        selectedNetworkId: HelpersUtil.caipNetworkIdToNumber(state.selectedNetworkId)
      })
    )
  }

  // -- Private -----------------------------------------------------------------
  private syncRequestedNetworks(chains: Web3ModalClientOptions['chains']) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `${ConstantsUtil.EIP155}:${chain.id}`,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.id],
          imageUrl: this.options?.chainImages?.[chain.id]
        }) as CaipNetwork
    )
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? [])
  }

  private async syncAccount({
    address,
    isConnected,
    chainId,
    config
  }: GetAccountReturnType & { config: Config }) {
    const chain = config?.chains.find((c: Chain) => c.id === chainId)

    this.resetAccount()
    // TOD0: Check with Sven. Now network is synced when acc is synced.
    this.syncNetwork()
    if (isConnected && address && chain) {
      const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chain.id}:${address}`
      this.setIsConnected(isConnected)
      this.setCaipAddress(caipAddress)
      await Promise.all([
        this.syncProfile(address, chain),
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
    const { address, isConnected, chainId } = getAccount(this.wagmiConfig)
    const chain = this.wagmiConfig.chains.find((c: Chain) => c.id === chainId)

    if (chain) {
      const caipChainId: CaipNetworkId = `${ConstantsUtil.EIP155}:${chainId}`
      this.setCaipNetwork({
        id: caipChainId,
        name: chain.name,
        imageId: PresetsUtil.EIP155NetworkImageIds[chain.id],
        imageUrl: this.options?.chainImages?.[chain.id]
      })
      if (isConnected && address) {
        const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chain.id}:${address}`
        this.setCaipAddress(caipAddress)
        if (chain.blockExplorers?.default?.url) {
          const url = `${chain.blockExplorers.default.url}/address/${address}`
          this.setAddressExplorerUrl(url)
        } else {
          this.setAddressExplorerUrl(undefined)
        }
        if (this.hasSyncedConnectedAccount) {
          await this.syncProfile(address, chain)
          await this.syncBalance(address, chain)
        }
      }
    }
  }

  private async syncProfile(address: Hex, chain: Chain) {
    if (chain.id !== mainnet.id) {
      this.setProfileName(null)
      this.setProfileImage(null)

      return
    }

    try {
      const { name, avatar } = await this.fetchIdentity({
        caipChainId: `${ConstantsUtil.EIP155}:${chain.id}`,
        address
      })
      this.setProfileName(name)
      this.setProfileImage(avatar)
    } catch {
      const profileName = await getEnsName(this.wagmiConfig, { address, chainId: chain.id })
      if (profileName) {
        this.setProfileName(profileName)
        const profileImage = await getEnsAvatar(this.wagmiConfig, {
          name: profileName,
          chainId: chain.id
        })
        if (profileImage) {
          this.setProfileImage(profileImage)
        }
      }
    }
  }

  private async syncBalance(address: Hex, chain: Chain) {
    const balance = await getBalance(this.wagmiConfig, {
      address,
      chainId: chain.id,
      token: this.options?.tokens?.[chain.id]?.address as Hex
    })
    this.setBalance(balance.formatted, balance.symbol)
  }

  private syncConnectors(wagmiConfig: Web3ModalClientOptions['wagmiConfig']) {
    const w3mConnectors: Connector[] = []
    console.log(wagmiConfig.connectors)
    wagmiConfig.connectors.forEach(({ name, type, icon }) => {
      if (![ConstantsUtil.EMAIL_CONNECTOR_ID].includes(type)) {
        w3mConnectors.push({
          id: type,
          explorerId: PresetsUtil.ConnectorExplorerIds[type],
          imageId: PresetsUtil.ConnectorImageIds[type],
          imageUrl: this.options?.connectorImages?.[type] ?? icon,
          name: PresetsUtil.ConnectorNamesMap[type] ?? name,
          type: PresetsUtil.ConnectorTypesMap[type] ?? 'EXTERNAL'
        })
      }
    })
    this.setConnectors(w3mConnectors)
  }

  private async syncEmailConnector(wagmiConfig: Web3ModalClientOptions['wagmiConfig']) {
    const emailConnector = wagmiConfig.connectors.find(({ id }) => id === 'w3mEmail')
    if (emailConnector) {
      const provider = await emailConnector.getProvider()
      this.addConnector({
        id: ConstantsUtil.EMAIL_CONNECTOR_ID,
        type: 'EMAIL',
        name: 'Email',
        provider
      })
    }
  }

  private async listenEmailConnector(wagmiConfig: Web3ModalClientOptions['wagmiConfig']) {
    const connector = wagmiConfig.connectors.find(c => c.id === ConstantsUtil.EMAIL_CONNECTOR_ID)

    if (typeof window !== 'undefined' && connector) {
      super.setLoading(true)
      const provider = (await connector.getProvider()) as W3mFrameProvider
      const isLoginEmailUsed = provider.getLoginEmailUsed()
      super.setLoading(isLoginEmailUsed)
      provider.onRpcRequest(() => {
        super.open({ view: 'ApproveTransaction' })
      })
      provider.onRpcResponse(() => {
        super.close()
      })
      provider.onIsConnected(() => {
        super.setLoading(false)
      })
    }
  }
}
