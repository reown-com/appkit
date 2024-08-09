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
import { type Chain } from '@web3modal/scaffold-utils'
import { type Chain as AvailablChain } from '@web3modal/common'
import UniversalProvider from '@walletconnect/universal-provider'
import type { Web3ModalSIWEClient } from '@web3modal/siwe'
import type { UniversalProviderOpts } from '@walletconnect/universal-provider'
import { NetworkUtil } from '@web3modal/common'
import { WcConstantsUtil } from '../../../utils/ConstantsUtil.js'
import { WcHelpersUtil } from '../../../utils/HelpersUtil.js'
import { WcStoreUtil } from '../../../utils/StoreUtil.js'
import type { AppKit } from '../../../src/client.js'
import type { SessionTypes } from '@walletconnect/types'

type Metadata = {
  name: string
  description: string
  url: string
  icons: string[]
}

// -- Types ---------------------------------------------------------------------
export interface Web3ModalClientOptions {
  chains?: Chain[]
  siweConfig?: Web3ModalSIWEClient
  defaultChain?: Chain
  chainImages?: Record<number | string, string>
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

    this.chains = chains || []

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

          const nsChains: CaipNetworkId[] | undefined = []

          if (ns) {
            Object.keys(ns).forEach(key => {
              if (ns?.[key]?.chains) {
                nsChains.push(...(ns[key].chains as `${string}:${string}`[]))
              }
            })
          }
          const result = {
            supportsAllNetworks: false,
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

        this.setWalletConnectProvider()
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

          if (NetworkController.state.caipNetwork) {
            this.appKit?.resetAccount('evm')
            this.appKit?.resetAccount('solana')
          }
        }

        // eslint-disable-next-line no-negated-condition
      },

      signMessage: async (message: string) => {
        const provider = await this.getWalletConnectProvider()

        if (!provider) {
          throw new Error('connectionControllerClient:signMessage - provider is undefined')
        }

        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, this.getAddress()]
        })

        return signature as string
      },

      estimateGas: async () => await Promise.resolve(BigInt(0)),
      // -- Transaction methods ---------------------------------------------------
      /**
       *
       * These methods are supported only on `wagmi` and `ethers` since the Solana SDK does not support them in the same way.
       * These function definition is to have a type parity between the clients. Currently not in use.
       */
      getEnsAvatar: async (value: string) => await Promise.resolve(value),

      getEnsAddress: async (value: string) => await Promise.resolve(value),

      writeContract: async () => await Promise.resolve('0x'),

      sendTransaction: async () => await Promise.resolve('0x'),

      parseUnits: () => BigInt(0),

      formatUnits: () => ''
    }
  }

  // -- Public ------------------------------------------------------------------
  public construct(appkit: AppKit, options: OptionsControllerState) {
    if (!options.projectId) {
      throw new Error('Solana:construct - projectId is undefined')
    }
    this.appKit = appkit
    this.options = options

    this.createProvider()
    this.syncRequestedNetworks(this.chains)
    this.syncConnectors()

    WcStoreUtil.subscribeKey('address', () => {
      this.syncAccount()
    })

    WcStoreUtil.subscribeKey('chainId', () => {
      // this.syncNetwork(this.options?.chainImages)
    })
  }

  public async disconnect() {
    if (this.walletConnectProvider) {
      await (this.walletConnectProvider as unknown as UniversalProvider).disconnect()
      WcStoreUtil.reset()
    }
  }

  // -- Private -----------------------------------------------------------------
  public getAddress() {
    const { address } = WcStoreUtil.state

    return address ? WcStoreUtil.state.address : address
  }

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
    const evmRequestedCaipNetworks = chains?.filter(c => c.chain === 'evm')
    const solanaRequestedCaipNetworks = chains?.filter(c => c.chain === 'solana')

    const evmCaipNetworks = evmRequestedCaipNetworks?.map(
      chain =>
        ({
          id: `${chain.chain === 'evm' ? ConstantsUtil.EIP155 : chain.chain}:${chain.chainId}`,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId],
          chain: chain.chain
        }) as CaipNetwork
    )
    const solanaCaipNetworks = solanaRequestedCaipNetworks?.map(
      chain =>
        ({
          id: `${chain.chain === 'evm' ? ConstantsUtil.EIP155 : chain.chain}:${chain.chainId}`,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId],
          chain: chain.chain
        }) as CaipNetwork
    )

    this.appKit?.setRequestedCaipNetworks(evmCaipNetworks ?? [], 'evm')
    this.appKit?.setRequestedCaipNetworks(solanaCaipNetworks ?? [], 'solana')
  }

  private async checkActiveWalletConnectProvider() {
    const WalletConnectProvider = await this.getWalletConnectProvider()
    const walletId = localStorage.getItem(WcConstantsUtil.WALLET_ID)

    if (WalletConnectProvider) {
      if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
        this.setWalletConnectProvider()
      }
    }

    const isConnected = walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
    WcStoreUtil.setStatus(isConnected ? 'connected' : 'disconnected')
  }

  private setWalletConnectProvider() {
    window?.localStorage.setItem(
      WcConstantsUtil.WALLET_ID,
      ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
    )

    const nameSpaces = this.walletConnectProvider?.session?.namespaces

    if (nameSpaces) {
      Object.keys(nameSpaces)
        .reverse()
        .forEach(key => {
          const chain = (key === 'eip155' ? 'evm' : key) as AvailablChain
          WcStoreUtil.setChains([chain === 'evm' ? 'eip155' : chain, ...WcStoreUtil.state.chains])
          const address = nameSpaces?.[key]?.accounts[0]
          const { chainId } = WcHelpersUtil.extractDetails(address)

          if (address) {
            WcStoreUtil.setChainId(Number(chainId))
            WcStoreUtil.setProvider(this.walletConnectProvider)
            WcStoreUtil.setProviderType('walletConnect')
            WcStoreUtil.setStatus('connected')

            this.appKit?.setIsConnected(true, chain)
            this.appKit?.setCaipAddress(address as CaipAddress, chain)
          }
        })
      if (!NetworkController.state.caipNetwork) {
        this.setDefaultNetwork(nameSpaces)
      } else if (
        !NetworkController.state.approvedCaipNetworkIds?.includes(
          NetworkController.state.caipNetwork.id
        )
      ) {
        this.setDefaultNetwork(nameSpaces)
      }
    }
    this.syncAccount()
    this.watchWalletConnect()
  }

  private setDefaultNetwork(nameSpaces: SessionTypes.Namespaces) {
    const chain = WcStoreUtil.state.chains[0]
    if (chain) {
      const chainNamespace = nameSpaces?.[chain]
      if (chainNamespace?.chains) {
        const chainId = chainNamespace.chains[0]

        if (chainId) {
          const requestedCaipNetworks = NetworkController.state?.requestedCaipNetworks

          if (requestedCaipNetworks) {
            const network = requestedCaipNetworks.find(c => c.id === chainId)

            if (network) {
              NetworkController.setDefaultCaipNetwork(network as unknown as CaipNetwork)
            }
          }
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
        const network = WcHelpersUtil.hexStringToNumber(chainId)
        WcStoreUtil.setChainId(network)
      }
    }

    const accountsChangedHandler = (accounts: string[]) => {
      if (accounts.length > 0) {
        this.setWalletConnectProvider()
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

  private getProviderData() {
    const provider = WcStoreUtil.state.provider
    const namespaces = provider?.session?.namespaces

    const { isConnected, preferredAccountType } = WcStoreUtil.state

    return {
      provider,
      namespaces,
      namespaceKeys: namespaces ? Object.keys(namespaces) : [],
      isConnected,
      preferredAccountType
    }
  }

  private syncAccount() {
    const { namespaceKeys, namespaces } = this.getProviderData()

    const { preferredAccountType } = WcStoreUtil.state
    const isConnected = this.appKit?.getIsConnectedState()

    if (isConnected) {
      namespaceKeys.forEach(async key => {
        const chain = (key === 'eip155' ? 'evm' : key) as AvailablChain
        const address = namespaces?.[key]?.accounts[0]

        this.appKit?.resetAccount(chain)
        this.appKit?.setIsConnected(isConnected, chain)
        this.appKit?.setPreferredAccountType(preferredAccountType, chain)

        this.appKit?.setCaipAddress(address as CaipAddress, chain)
        this.syncConnectedWalletInfo()

        await Promise.all([this.appKit?.setApprovedCaipNetworksData(chain)])
      })
    } else {
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
      this.appKit?.setConnectedWalletInfo({ name: currentActiveWallet }, 'evm')
      this.appKit?.setConnectedWalletInfo({ name: currentActiveWallet }, 'solana')
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
