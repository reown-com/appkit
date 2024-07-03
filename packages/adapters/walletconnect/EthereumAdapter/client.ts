/* eslint-disable max-depth */
import {
  type CaipNetwork,
  type CaipNetworkId,
  type ConnectionControllerClient,
  type NetworkControllerClient,
  type OptionsControllerState,
  type Token
} from '@web3modal/appkit'
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import EthereumProvider, { OPTIONAL_METHODS } from '@walletconnect/ethereum-provider'
import type { Web3ModalSIWEClient } from '@web3modal/siwe'
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider'
import { NetworkUtil } from '@web3modal/common'
import { WalletConnectConstanstUtil } from '../utils/ConstantsUtil.js'
import { WalletConnectHelpersUtil } from '../utils/HelpersUtil.js'

type Chain = {
  rpcUrl: string
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
export class EthereumAdapterClient {
  private walletConnectProvider?: EthereumProvider

  private walletConnectProviderInitPromise?: Promise<void>

  private chains: Chain[]

  private metadata?: Metadata

  public chain: 'evm' | 'solana'

  public networkControllerClient: NetworkControllerClient

  public connectionControllerClient: ConnectionControllerClient

  private scaffold: any | undefined = undefined

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
            await this.switchNetwork(chainId)
          } catch (error) {
            throw new Error('networkControllerClient:switchCaipNetwork - unable to switch chain')
          }
        }
      },

      getApprovedCaipNetworksData: async () =>
        new Promise(resolve => {
          if (!this.walletConnectProvider) {
            throw new Error(
              'networkControllerClient:getApprovedCaipNetworks - connector is undefined'
            )
          }
          const ns = this.walletConnectProvider.signer?.session?.namespaces
          const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods
          const nsChains = ns?.[ConstantsUtil.EIP155]?.chains

          const result = {
            supportsAllNetworks: nsMethods?.includes(ConstantsUtil.ADD_CHAIN_METHOD) ?? false,
            approvedCaipNetworkIds: nsChains as CaipNetworkId[] | undefined
          }

          resolve(result)
        })
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
            methods: OPTIONAL_METHODS,
            ...(await siweConfig.getMessageParams())
          })

          console.log('hoooo')

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
              const message = WalletConnectProvider.signer.client.formatAuthMessage({
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
          await WalletConnectProvider.connect()
        }

        await this.setWalletConnectProvider()
      },

      disconnect: async () => {
        if (siweConfig?.options?.signOutOnDisconnect) {
          const { SIWEController } = await import('@web3modal/siwe')
          await SIWEController.signOut()
        }

        if (this.walletConnectProvider) {
          await (this.walletConnectProvider as unknown as EthereumProvider).disconnect()
        }
        // eslint-disable-next-line no-negated-condition
      }
    }
  }

  // -- Public ------------------------------------------------------------------
  public construct(scaffold: any, options: OptionsControllerState) {
    if (!options.projectId) {
      throw new Error('Solana:construct - projectId is undefined')
    }
    this.scaffold = scaffold
    this.options = options

    this.createProvider()
    this.syncRequestedNetworks(this.chains, this.options.chainImages)

    this.scaffold.replace('ConnectingWalletConnect')
  }

  public async disconnect() {
    if (this.walletConnectProvider) {
      await (this.walletConnectProvider as unknown as EthereumProvider).disconnect()
    }
  }

  // -- Private -----------------------------------------------------------------
  private createProvider() {
    if (!this.walletConnectProviderInitPromise && typeof window !== 'undefined') {
      this.walletConnectProviderInitPromise = this.initWalletConnectProvider()
    }

    return this.walletConnectProviderInitPromise
  }

  private async initWalletConnectProvider() {
    console.log(this.metadata, this.chains)

    const walletConnectProviderOptions: EthereumProviderOptions = {
      projectId: this.options?.projectId,
      showQrModal: false,
      rpcMap: this.chains
        ? this.chains.reduce<Record<number, string>>((map, chain) => {
            map[chain.chainId] = chain.rpcUrl

            return map
          }, {})
        : ({} as Record<number, string>),
      optionalChains: [...this.chains.map(chain => chain.chainId)] as [number],
      metadata: {
        name: this.metadata ? this.metadata.name : '',
        description: this.metadata ? this.metadata.description : '',
        url: this.metadata ? this.metadata.url : '',
        icons: this.metadata ? this.metadata.icons : ['']
      }
    }

    this.walletConnectProvider = await EthereumProvider.init(walletConnectProviderOptions)

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
          id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId]
        }) as CaipNetwork
    )
    this.scaffold?.setRequestedCaipNetworks(requestedCaipNetworks ?? [], this.chain)
  }

  private async checkActiveWalletConnectProvider() {
    const WalletConnectProvider = await this.getWalletConnectProvider()
    const walletId = localStorage.getItem(WalletConnectConstanstUtil.WALLET_ID)

    if (WalletConnectProvider) {
      if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
        await this.setWalletConnectProvider()
      }
    }

    // const isConnected = EthersStoreUtil.state.isConnected
    // EthersStoreUtil.setStatus(isConnected ? 'connected' : 'disconnected')
  }

  private async setWalletConnectProvider() {
    window?.localStorage.setItem(
      WalletConnectConstanstUtil.WALLET_ID,
      ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
    )
    const WalletConnectProvider = await this.getWalletConnectProvider()
    if (WalletConnectProvider) {
      this.watchWalletConnect()
    }
  }

  private async watchWalletConnect() {
    const provider = await this.getWalletConnectProvider()

    function disconnectHandler() {
      localStorage.removeItem(WalletConnectConstanstUtil.WALLET_ID)

      provider?.removeListener('disconnect', disconnectHandler)
      provider?.removeListener('accountsChanged', accountsChangedHandler)
      provider?.removeListener('chainChanged', chainChangedHandler)
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        WalletConnectHelpersUtil.hexStringToNumber(chainId)
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

  public async switchNetwork(chainId: number) {
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (this.walletConnectProvider && chain) {
        try {
          await this.walletConnectProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: WalletConnectHelpersUtil.numberToHexString(chain.chainId) }]
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (switchError: any) {
          throw new Error('Chain is not supported')
        }
      }
    }
  }
}
