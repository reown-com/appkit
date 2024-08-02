/* eslint-disable max-depth */
import {
  AccountController,
  ConnectionController,
  NetworkController,
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ConnectionControllerClient,
  type Connector,
  type NetworkControllerClient,
  type OptionsControllerState,
  type Token
} from '@web3modal/core'
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import UniversalProvider from '@walletconnect/universal-provider'
import type { Web3ModalSIWEClient } from '@web3modal/siwe'
import type { UniversalProviderOpts } from '@walletconnect/universal-provider'
import { NetworkUtil } from '@web3modal/common'
import { WcConstantsUtil } from '../../../utils/ConstantsUtil.js'
import { WcHelpersUtil } from '../../../utils/HelpersUtil.js'
import { WcStoreUtil } from '../../../utils/StoreUtil.js'
import type { AppKit } from '../../../src/client.js'

type Chain = {
  rpcUrl: string
  chain: 'evm' | 'solana'
  explorerUrl: string
  currency: string
  name: string
  chainId: number
}

type Metadata = {
  name: string
  description: string
  url: string
  icons: string[]
}

// -- Types ---------------------------------------------------------------------
export interface Web3ModalClientOptions {
  chains: Chain[]
  siweConfig?: Web3ModalSIWEClient
  defaultChain?: Chain
  chainImages?: Record<number, string>
  connectorImages?: Record<string, string>
  tokens?: Record<number, Token>
  metadata?: Metadata
}

export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion'>

// -- Client --------------------------------------------------------------------
export class UniversalAdapterClient {
  private walletConnectProvider?: UniversalProvider

  private walletConnectProviderInitPromise?: Promise<void>

  private chains: Chain[]

  private metadata?: Metadata

  public isUniversalAdapterClient = true

  public chain: 'evm' | 'solana'

  public networkControllerClient: NetworkControllerClient

  public connectionControllerClient: ConnectionControllerClient

  private appKit: AppKit | undefined = undefined

  public options: OptionsControllerState | undefined = undefined

  public constructor(options: Web3ModalClientOptions) {
    const { siweConfig, chains, metadata } = options

    this.chain = 'evm'

    this.metadata = metadata

    this.chains = chains

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = NetworkUtil.caipNetworkIdToNumber(caipNetwork?.id)
        if (chainId) {
          try {
            this.switchNetwork(chainId)
          } catch (error) {
            throw new Error('networkControllerClient:switchCaipNetwork - unable to switch chain')
          }
        }
      },

      getApprovedCaipNetworksData: async () => {
        await this.getWalletConnectProvider()

        return new Promise(resolve => {
          const ns = this.walletConnectProvider?.session?.namespaces
          const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods
          const nsChains = ns?.[ConstantsUtil.EIP155]?.chains

          const result = {
            supportsAllNetworks: nsMethods?.includes(ConstantsUtil.ADD_CHAIN_METHOD) ?? false,
            approvedCaipNetworkIds: nsChains as CaipNetworkId[] | undefined
          }

          resolve(result)
        })
      }
    }

    this.connectionControllerClient = {
      connectWalletConnect: async onUri => {
        const WalletConnectProvider = await this.getWalletConnectProvider()
        if (!WalletConnectProvider) {
          throw new Error('connectionControllerClient:getWalletConnectUri - provider is undefined')
        }

        WalletConnectProvider.on('display_uri', (uri: string) => {
          onUri(uri)
        })

        if (siweConfig?.options?.enabled) {
          const { SIWEController, getDidChainId, getDidAddress } = await import('@web3modal/siwe')
          const result = await WalletConnectProvider.authenticate({
            nonce: await siweConfig.getNonce(),
            methods: undefined,
            uri: '',
            chains: [],
            domain: ''
          })

          // Auths is an array of signed CACAO objects https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-74.md
          const signedCacao = result?.auths?.[0]
          if (signedCacao) {
            const { p, s } = signedCacao
            const chainId = getDidChainId(p.iss)
            const address = getDidAddress(p.iss)
            if (address && chainId) {
              SIWEController.setSession({
                address,
                chainId: parseInt(chainId, 10)
              })
            }
            try {
              // Kicks off verifyMessage and populates external states
              const message = WalletConnectProvider.client.formatAuthMessage({
                request: p,
                iss: p.iss
              })

              await SIWEController.verifyMessage({
                message,
                signature: s.s,
                cacao: signedCacao
              })
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('Error verifying message', error)
              // eslint-disable-next-line no-console
              await WalletConnectProvider.disconnect().catch(console.error)
              // eslint-disable-next-line no-console
              await SIWEController.signOut().catch(console.error)
              throw error
            }
          }
        } else {
          const namespaces = WcHelpersUtil.createNamespaces(this.chains)

          await WalletConnectProvider.connect({ optionalNamespaces: namespaces })
        }

        await this.setWalletConnectProvider()
      },

      disconnect: async () => {
        WcStoreUtil.reset()
        localStorage.removeItem(WcConstantsUtil.WALLET_ID)

        if (siweConfig?.options?.signOutOnDisconnect) {
          const { SIWEController } = await import('@web3modal/siwe')
          await SIWEController.signOut()
        }

        if (this.walletConnectProvider) {
          await this.walletConnectProvider.disconnect()
        }
        // eslint-disable-next-line no-negated-condition
      }
    }
  }

  // -- Public ------------------------------------------------------------------
  public construct(appkit: any, options: OptionsControllerState) {
    if (!options.projectId) {
      throw new Error('Solana:construct - projectId is undefined')
    }
    this.appKit = appkit
    this.options = options

    WcStoreUtil.subscribeKey('address', () => {
      this.syncAccount()
    })

    // EthersStoreUtil.subscribeKey('chainId', () => {
    //   this.syncNetwork(chainImages)
    // })

    this.createProvider()
    this.syncRequestedNetworks(this.chains)
    this.syncConnectors()
  }

  public async disconnect() {
    if (this.walletConnectProvider) {
      await (this.walletConnectProvider as unknown as UniversalProvider).disconnect()
      WcStoreUtil.reset()
    }
  }

  // -- Private -----------------------------------------------------------------
  private createProvider() {
    if (
      !this.walletConnectProviderInitPromise &&
      typeof window !== 'undefined' &&
      this.options?.projectId
    ) {
      this.walletConnectProviderInitPromise = this.initWalletConnectProvider(
        this.options?.projectId
      )
    }

    return this.walletConnectProviderInitPromise
  }

  private async initWalletConnectProvider(projectId: string) {
    const walletConnectProviderOptions: UniversalProviderOpts = {
      projectId,
      metadata: {
        name: this.metadata ? this.metadata.name : '',
        description: this.metadata ? this.metadata.description : '',
        url: this.metadata ? this.metadata.url : '',
        icons: this.metadata ? this.metadata.icons : ['']
      }
    }

    this.walletConnectProvider = await UniversalProvider.init(walletConnectProviderOptions)

    await this.checkActiveWalletConnectProvider()
  }

  private async getWalletConnectProvider() {
    if (!this.walletConnectProvider) {
      try {
        await this.createProvider()
      } catch (error) {
        throw new Error('EthereumAdapter:getWalletConnectProvider - Cannot create provider')
      }
    }

    return this.walletConnectProvider
  }

  private syncRequestedNetworks(
    chains: Web3ModalClientOptions['chains'],
    chainImages?: Web3ModalClientOptions['chainImages']
  ) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `${chain.chain === 'evm' ? ConstantsUtil.EIP155 : chain.chain}:${chain.chainId}`,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId],
          chain: chain.chain
        }) as CaipNetwork
    )

    this.appKit?.setRequestedCaipNetworks(requestedCaipNetworks ?? [], this.chain)
  }

  private async checkActiveWalletConnectProvider() {
    const WalletConnectProvider = await this.getWalletConnectProvider()
    const walletId = localStorage.getItem(WcConstantsUtil.WALLET_ID)

    if (WalletConnectProvider) {
      if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
        await this.setWalletConnectProvider()
      }
    }

    const isConnected = WcStoreUtil.state.isConnected
    WcStoreUtil.setStatus(isConnected ? 'connected' : 'disconnected')
  }

  private async setWalletConnectProvider() {
    window?.localStorage.setItem(
      WcConstantsUtil.WALLET_ID,
      ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
    )

    const chainType = this.chain === 'evm' ? 'eip155' : this.chain

    if (this.walletConnectProvider?.session?.namespaces[chainType]?.accounts[0]) {
      const { chainId, address } = WcHelpersUtil.extractDetails(
        this.walletConnectProvider?.session?.namespaces[chainType]?.accounts[0]
      )

      if (address && chainId) {
        WcStoreUtil.setChainId(Number(chainId))
        WcStoreUtil.setProvider(this.walletConnectProvider)
        WcStoreUtil.setProviderType('walletConnect')
        WcStoreUtil.setStatus('connected')
        WcStoreUtil.setIsConnected(true)
        WcStoreUtil.setAddress(address)
        const WalletConnectProvider = await this.getWalletConnectProvider()
        if (WalletConnectProvider) {
          this.watchWalletConnect()
        }
      }
    }
  }

  private async watchWalletConnect() {
    const provider = await this.getWalletConnectProvider()
    const chain = this.chain

    function disconnectHandler() {
      AccountController.resetAccount(chain)
      ConnectionController.resetWcConnection()

      localStorage.removeItem(WcConstantsUtil.WALLET_ID)

      provider?.removeListener('disconnect', disconnectHandler)
      provider?.removeListener('accountsChanged', accountsChangedHandler)
      provider?.removeListener('chainChanged', chainChangedHandler)
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        WcHelpersUtil.hexStringToNumber(chainId)
      }
    }

    const accountsChangedHandler = async (accounts: string[]) => {
      if (accounts.length > 0) {
        await this.setWalletConnectProvider()
      }
    }

    if (provider) {
      provider.on('disconnect', disconnectHandler)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('chainChanged', chainChangedHandler)
    }
  }

  public switchNetwork(chainId: number) {
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (this.walletConnectProvider && chain) {
        const caipChain = `${chain.chain === 'evm' ? 'eip155' : chain.chain}:${chain.chainId}`
        this.walletConnectProvider.setDefaultChain(caipChain)
      }
    }
  }

  private async syncAccount() {
    const { address, chainId, isConnected, providerType, preferredAccountType } = WcStoreUtil.state

    this.appKit?.resetAccount(this.chain)

    if (isConnected && address && chainId) {
      if (providerType === 'walletConnect') {
        const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`

        this.appKit?.setIsConnected(isConnected, this.chain)
        this.appKit?.setPreferredAccountType(preferredAccountType, this.chain)
        this.appKit?.setCaipAddress(caipAddress, this.chain)
        this.syncConnectedWalletInfo()
        await Promise.all([this.appKit?.setApprovedCaipNetworksData(this.chain)])
      }
    } else if (!isConnected) {
      this.appKit?.resetWcConnection()
      this.appKit?.resetNetwork()
    }
  }

  private syncConnectedWalletInfo() {
    const currentActiveWallet = window?.localStorage.getItem(WcConstantsUtil.WALLET_ID)

    if (this.walletConnectProvider?.session) {
      this.appKit?.setConnectedWalletInfo(
        {
          ...this.walletConnectProvider.session.peer.metadata,
          name: this.walletConnectProvider.session.peer.metadata.name,
          icon: this.walletConnectProvider.session.peer.metadata.icons?.[0]
        },
        this.chain
      )
    } else if (currentActiveWallet) {
      this.appKit?.setConnectedWalletInfo({ name: currentActiveWallet }, this.chain)
    }
  }

  private syncConnectors() {
    const w3mConnectors: Connector[] = []

    w3mConnectors.push({
      id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
      explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
      imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
      name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
      type: 'WALLET_CONNECT',
      chain: this.chain
    })

    this.appKit?.setConnectors(w3mConnectors)
  }
}
