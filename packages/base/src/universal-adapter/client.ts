/* eslint-disable max-depth */
import {
  AccountController,
  ChainController,
  ConnectionController,
  NetworkController,
  type ConnectionControllerClient,
  type Connector,
  type NetworkControllerClient
} from '@web3modal/core'
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import UniversalProvider from '@walletconnect/universal-provider'
import type { UniversalProviderOpts } from '@walletconnect/universal-provider'
import { WcHelpersUtil } from '../utils/HelpersUtil.js'
import type { AppKit } from '../client.js'
import type { SessionTypes } from '@walletconnect/types'
import {
  type CaipNetwork,
  type CaipNetworkId,
  type CaipAddress,
  type ChainNamespace,
  type AdapterType
} from '@web3modal/common'
import { ProviderUtil } from '@web3modal/base/store'
import { WcConstantsUtil } from '@web3modal/base/utils'
import type { AppKitOptions } from '../utils/TypesUtil.js'

type Metadata = {
  name: string
  description: string
  url: string
  icons: string[]
}

// -- Client --------------------------------------------------------------------
export class UniversalAdapterClient {
  public caipNetworks: CaipNetwork[]

  private walletConnectProvider?: UniversalProvider

  private walletConnectProviderInitPromise?: Promise<void>

  private metadata?: Metadata

  public isUniversalAdapterClient = true

  public chainNamespace: ChainNamespace

  public defaultNetwork: CaipNetwork | undefined = undefined

  public networkControllerClient: NetworkControllerClient

  public connectionControllerClient: ConnectionControllerClient

  private appKit: AppKit | undefined = undefined

  public options: AppKitOptions | undefined = undefined

  public adapterType: AdapterType = 'universal'

  public constructor(options: AppKitOptions) {
    const { siweConfig, caipNetworks, metadata } = options

    this.caipNetworks = caipNetworks

    this.chainNamespace = 'eip155'

    this.metadata = metadata

    this.caipNetworks = caipNetworks

    this.defaultNetwork = options.defaultCaipNetwork || this.caipNetworks[0]

    this.networkControllerClient = {
      // @ts-expect-error switchCaipNetwork is async for some adapter but not for this adapter
      switchCaipNetwork: caipNetwork => {
        if (caipNetwork) {
          localStorage.setItem(WcConstantsUtil.ACTIVE_CAIPNETWORK, JSON.stringify(caipNetwork))
          try {
            this.switchNetwork(caipNetwork)
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
              const chains = ns?.[key]?.chains
              if (chains) {
                nsChains.push(...(chains as CaipNetworkId[]))
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
        if (
          ChainController.state.activeChain &&
          ChainController.state?.chains?.get(ChainController.state.activeChain)?.adapterType ===
            'wagmi'
        ) {
          const adapter = ChainController.state.chains.get(ChainController.state.activeChain)
          await adapter?.connectionControllerClient?.connectWalletConnect?.(onUri)
          this.setWalletConnectProvider()
        } else {
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
            const optionalNamespaces = WcHelpersUtil.createNamespaces(this.caipNetworks)
            await WalletConnectProvider.connect({ optionalNamespaces })
          }
          this.setWalletConnectProvider()
        }
      },

      disconnect: async () => {
        this.appKit?.resetAccount('eip155')
        this.appKit?.resetAccount('solana')
        localStorage.removeItem(WcConstantsUtil.WALLET_ID)
        localStorage.removeItem(WcConstantsUtil.ACTIVE_CAIPNETWORK)

        if (siweConfig?.options?.signOutOnDisconnect) {
          const { SIWEController } = await import('@web3modal/siwe')
          await SIWEController.signOut()
        }

        if (this.walletConnectProvider) {
          await this.walletConnectProvider.disconnect()

          if (NetworkController.state.caipNetwork) {
            this.appKit?.resetAccount('eip155')
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
          params: [message, this.appKit?.getAddress()]
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
  public construct(appkit: AppKit, options: AppKitOptions) {
    if (!options.projectId) {
      throw new Error('Solana:construct - projectId is undefined')
    }
    this.appKit = appkit
    this.options = options

    this.createProvider()
    this.syncRequestedNetworks(this.caipNetworks)
    this.syncConnectors()
  }

  public async disconnect() {
    if (this.walletConnectProvider) {
      await (this.walletConnectProvider as unknown as UniversalProvider).disconnect()
      this.appKit?.resetAccount('eip155')
      this.appKit?.resetAccount('solana')
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

  public async getWalletConnectProvider() {
    if (!this.walletConnectProvider) {
      try {
        await this.createProvider()
      } catch (error) {
        throw new Error('EthereumAdapter:getWalletConnectProvider - Cannot create provider')
      }
    }

    return this.walletConnectProvider
  }

  private syncRequestedNetworks(caipNetworks: AppKitOptions['caipNetworks']) {
    const uniqueChainNamespaces = [
      ...new Set(caipNetworks.map(caipNetwork => caipNetwork.chainNamespace))
    ]
    uniqueChainNamespaces
      .filter(c => Boolean(c))
      .forEach(chainNamespace => {
        this.appKit?.setRequestedCaipNetworks(
          caipNetworks.filter(caipNetwork => caipNetwork.chainNamespace === chainNamespace),
          chainNamespace
        )
      })
  }

  private async checkActiveWalletConnectProvider() {
    const WalletConnectProvider = await this.getWalletConnectProvider()
    const walletId = localStorage.getItem(WcConstantsUtil.WALLET_ID)

    if (WalletConnectProvider) {
      if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
        this.setWalletConnectProvider()
      }
    }
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
          const caipAddress = nameSpaces?.[key]?.accounts[0] as CaipAddress

          ProviderUtil.setProvider(key as ChainNamespace, this.walletConnectProvider)
          ProviderUtil.setProviderId(key as ChainNamespace, 'walletConnect')

          if (caipAddress) {
            this.appKit?.setIsConnected(true, key as ChainNamespace)
            this.appKit?.setCaipAddress(caipAddress, key as ChainNamespace)
          }
        })
      const storedCaipNetwork = localStorage.getItem(WcConstantsUtil.ACTIVE_CAIPNETWORK)
      if (storedCaipNetwork) {
        const parsedCaipNetwork = JSON.parse(storedCaipNetwork) as CaipNetwork
        NetworkController.setActiveCaipNetwork(parsedCaipNetwork)
      } else if (!NetworkController.state.caipNetwork) {
        this.setDefaultNetwork(nameSpaces)
      } else if (
        !NetworkController.state.approvedCaipNetworkIds?.includes(
          NetworkController.state.caipNetwork.id
        )
      ) {
        this.setDefaultNetwork(nameSpaces)
      }
    }
    localStorage.setItem(
      WcConstantsUtil.ACTIVE_CAIPNETWORK,
      JSON.stringify(this.appKit?.getCaipNetwork())
    )
    this.syncAccount()
    this.watchWalletConnect()
  }

  private setDefaultNetwork(nameSpaces: SessionTypes.Namespaces) {
    const chainNamespace = this.caipNetworks[0]?.chainNamespace

    if (chainNamespace) {
      const namespace = nameSpaces?.[chainNamespace]

      if (namespace?.chains) {
        const chainId = namespace.chains[0]

        if (chainId) {
          const requestedCaipNetworks = NetworkController.state?.requestedCaipNetworks

          if (requestedCaipNetworks) {
            const network = requestedCaipNetworks.find(c => c.id === chainId)

            if (network) {
              NetworkController.setActiveCaipNetwork(network as unknown as CaipNetwork)
            }
          }
        }
      }
    }
  }

  private async watchWalletConnect() {
    const provider = await this.getWalletConnectProvider()
    const chainNamespace = this.chainNamespace

    function disconnectHandler() {
      AccountController.resetAccount(chainNamespace)
      ConnectionController.resetWcConnection()

      localStorage.removeItem(WcConstantsUtil.WALLET_ID)
      localStorage.removeItem(WcConstantsUtil.ACTIVE_CAIPNETWORK)

      provider?.removeListener('disconnect', disconnectHandler)
      provider?.removeListener('accountsChanged', accountsChangedHandler)
    }

    const accountsChangedHandler = (accounts: string[]) => {
      if (accounts.length > 0) {
        this.syncAccount()
      }
    }

    const chainChanged = (chainId: number | string) => {
      // eslint-disable-next-line eqeqeq
      const caipNetwork = this.caipNetworks.find(c => c.chainId == chainId)

      if (caipNetwork) {
        NetworkController.setActiveCaipNetwork(caipNetwork)
      }
    }

    if (provider) {
      provider.on('disconnect', disconnectHandler)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('chainChanged', chainChanged)
    }
  }

  public switchNetwork(caipNetwork: CaipNetwork) {
    if (caipNetwork) {
      if (this.walletConnectProvider) {
        this.walletConnectProvider.setDefaultChain(caipNetwork.id)
      }
    }
  }

  private getProviderData() {
    const namespaces = this.walletConnectProvider?.session?.namespaces || {}

    const isConnected = this.appKit?.getIsConnectedState() || false
    const preferredAccountType = this.appKit?.getPreferredAccountType() || ''

    return {
      provider: this.walletConnectProvider,
      namespaces,
      namespaceKeys: namespaces ? Object.keys(namespaces) : [],
      isConnected,
      preferredAccountType
    }
  }

  private syncAccount() {
    const { namespaceKeys, namespaces } = this.getProviderData()

    const preferredAccountType = this.appKit?.getPreferredAccountType()
    const isConnected = this.appKit?.getIsConnectedState()

    if (isConnected) {
      namespaceKeys.forEach(async key => {
        const chainNamespace = key as ChainNamespace
        const address = namespaces?.[key]?.accounts[0] as CaipAddress

        this.appKit?.setIsConnected(isConnected, chainNamespace)
        this.appKit?.setPreferredAccountType(preferredAccountType, chainNamespace)
        this.appKit?.setCaipAddress(address, chainNamespace)
        this.syncConnectedWalletInfo()

        await Promise.all([this.appKit?.setApprovedCaipNetworksData(chainNamespace)])
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
        this.chainNamespace
      )
    } else if (currentActiveWallet) {
      this.appKit?.setConnectedWalletInfo({ name: currentActiveWallet }, 'eip155')
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
      chain: this.chainNamespace
    })

    this.appKit?.setConnectors(w3mConnectors)
  }
}
