/* eslint-disable max-depth */
import type {
  CaipAddress,
  CaipNetwork,
  CaipNetworkId,
  ConnectionControllerClient,
  Connector,
  LibraryOptions,
  NetworkControllerClient,
  PublicStateControllerState,
  SendTransactionArgs,
  Token
} from '@web3modal/scaffold'
import { Web3ModalScaffold } from '@web3modal/scaffold'
import { ConstantsUtil, PresetsUtil, HelpersUtil } from '@web3modal/scaffold-utils'
import EthereumProvider from '@walletconnect/ethereum-provider'
import type { Web3ModalSIWEClient } from '@web3modal/siwe'
import {
  formatEther,
  JsonRpcProvider,
  InfuraProvider,
  getAddress as getOriginalAddress,
  parseUnits,
  formatUnits
} from 'ethers'
import type { Eip1193Provider } from 'ethers'
import {
  W3mFrameProvider,
  W3mFrameHelpers,
  W3mFrameRpcConstants,
  W3mFrameConstants
} from '@web3modal/wallet'
import { BrowserProvider } from 'ethers'
import { JsonRpcSigner } from 'ethers'
import { NetworkUtil } from '@web3modal/common'
import type { W3mFrameTypes } from '@web3modal/wallet'
import type { Address, Chain, Provider, ProviderType } from './utils/EthersTypesUtil.js'
import { EthersStoreUtil, type EthersStoreUtilState } from './utils/EthersStoreUtil.js'
import { EthersConstantsUtil } from './utils/EthersConstantsUtil.js'
import { EthersHelpersUtil } from './utils/EthersHelpersUtil.js'
import { EIP6963Connector } from './connectors/eip6963.js'
import type { Injected } from './connectors/injected.js'

// -- Types ---------------------------------------------------------------------
export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  ethersConfig: ProviderType
  chains: Chain[]
  siweConfig?: Web3ModalSIWEClient
  defaultChain?: Chain
  chainImages?: Record<number, string>
  connectorImages?: Record<string, string>
  tokens?: Record<number, Token>
  connectors: Injected[]
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

interface EIP6963ProviderDetail {
  info: Info
  provider: Provider
}

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  private hasSyncedConnectedAccount = false
  private chains: Chain[]
  private options: Web3ModalClientOptions | undefined = undefined
  private emailProvider?: W3mFrameProvider

  constructor(options: Web3ModalClientOptions) {
    const {
      ethersConfig,
      siweConfig,
      chains,
      defaultChain,
      tokens,
      chainImages,
      _sdkVersion,
      ...w3mOptions
    } = options

    EthersStoreUtil.setSupportedChains(chains)

    if (!ethersConfig) {
      throw new Error('web3modal:constructor - ethersConfig is undefined')
    }

    if (!w3mOptions.projectId) {
      throw new Error('web3modal:constructor - projectId is undefined')
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = NetworkUtil.caipNetworkIdToNumber(caipNetwork?.id)
        if (chainId) {
          try {
            EthersStoreUtil.setError(undefined)
            await this.switchNetwork(chainId)
          } catch (error) {
            EthersStoreUtil.setError(error)
            throw new Error('networkControllerClient:switchCaipNetwork - unable to switch chain')
          }
        }
      },

      getApprovedCaipNetworksData: async () =>
        new Promise(async resolve => {
          const walletChoice = localStorage.getItem(EthersConstantsUtil.WALLET_ID)
          const WCId = ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
          if (walletChoice?.includes(WCId)) {
            const connector = this.getConnectors().find(c => c.id === WCId)
            const provider = await connector?.getProvider?.<EthereumProvider>()

            if (!provider) {
              throw new Error(
                'networkControllerClient:getApprovedCaipNetworks - connector is undefined'
              )
            }
            const ns = provider.signer?.session?.namespaces
            const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods
            const nsChains = ns?.[ConstantsUtil.EIP155]?.chains

            const result = {
              supportsAllNetworks: nsMethods?.includes(ConstantsUtil.ADD_CHAIN_METHOD) ?? false,
              approvedCaipNetworkIds: nsChains as CaipNetworkId[] | undefined
            }

            resolve(result)
          } else {
            const result = {
              approvedCaipNetworkIds: undefined,
              supportsAllNetworks: true
            }

            resolve(result)
          }
        })
    }

    const connectionControllerClient: ConnectionControllerClient = {
      connectWalletConnect: async onUri => {
        const WCId = ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
        const connector = this.getConnectors().find(c => c.id === WCId)
        const provider = await connector?.getProvider?.<EthereumProvider>()

        if (!provider) {
          throw new Error('connectionControllerClient:getWalletConnectUri - provider is undefined')
        }

        provider.on('display_uri', (uri: string) => {
          onUri(uri)
        })

        await connector?.connect?.()
      },

      //  @ts-expect-error TODO expected types in arguments are incomplete
      connectExternal: async connector => await connector.connect(),

      checkInstalled: () => Boolean(window.ethereum),

      // eslint-disable-next-line @typescript-eslint/require-await
      disconnect: async () => {
        const connectorId = localStorage.getItem(EthersConstantsUtil.WALLET_ID)
        const connector = this.getConnectors().find(c => c.id === connectorId)
        connector?.disconnect?.()
        localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
        EthersStoreUtil.reset()
      },

      signMessage: async (message: string) => {
        const provider = EthersStoreUtil.state.provider
        if (!provider) {
          throw new Error('connectionControllerClient:signMessage - provider is undefined')
        }

        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, this.getAddress()]
        })

        return signature as `0x${string}`
      },

      parseUnits: (value: string, decimals: number) => parseUnits(value, decimals),

      formatUnits: (value: bigint, decimals: number) => formatUnits(value, decimals),

      async estimateGas(data) {
        const chainId = EthersStoreUtil.state.chainId
        const provider = EthersStoreUtil.state.provider
        const address = EthersStoreUtil.state.address

        if (!provider) {
          throw new Error('connectionControllerClient:sendTransaction - provider is undefined')
        }

        if (!address) {
          throw new Error('connectionControllerClient:sendTransaction - address is undefined')
        }

        const txParams = {
          from: data.address,
          to: data.to,
          data: data.data,
          type: 0
        }

        const browserProvider = new BrowserProvider(provider, chainId)
        const signer = new JsonRpcSigner(browserProvider, address)
        const gas = await signer.estimateGas(txParams)

        return gas
      },

      sendTransaction: async (data: SendTransactionArgs) => {
        const chainId = EthersStoreUtil.state.chainId
        const provider = EthersStoreUtil.state.provider
        const address = EthersStoreUtil.state.address

        if (!provider) {
          throw new Error('connectionControllerClient:sendTransaction - provider is undefined')
        }

        if (!address) {
          throw new Error('connectionControllerClient:sendTransaction - address is undefined')
        }

        const txParams = {
          to: data.to,
          value: data.value,
          gasLimit: data.gas,
          gasPrice: data.gasPrice,
          data: data.data,
          type: 0
        }

        const browserProvider = new BrowserProvider(provider, chainId)
        const signer = new JsonRpcSigner(browserProvider, address)
        const txResponse = await signer.sendTransaction(txParams)
        const txReceipt = await txResponse.wait()

        return (txReceipt?.hash as `0x${string}`) || null
      }
    }

    super({
      networkControllerClient,
      connectionControllerClient,
      siweControllerClient: siweConfig,
      defaultChain: EthersHelpersUtil.getCaipDefaultChain(defaultChain),
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `html-ethers-${ConstantsUtil.VERSION}`,
      ...w3mOptions
    })

    this.options = options
    this.chains = chains

    EthersStoreUtil.subscribeKey('address', () => {
      this.syncAccount()
    })

    EthersStoreUtil.subscribeKey('chainId', () => {
      this.syncNetwork(chainImages)
    })

    this.syncRequestedNetworks(chains, chainImages)
    this.syncConnectors(ethersConfig)

    if (ethersConfig.EIP6963) {
      this.listenConnectors(ethersConfig.EIP6963)
    }

    if (ethersConfig.email) {
      this.syncEmailConnector(w3mOptions.projectId)
    }
  }

  // -- Public ------------------------------------------------------------------

  // @ts-expect-error: Overriden state type is correct
  public override getState() {
    const state = super.getState()

    return {
      ...state,
      selectedNetworkId: NetworkUtil.caipNetworkIdToNumber(state.selectedNetworkId)
    }
  }

  // @ts-expect-error: Overriden state type is correct
  public override subscribeState(callback: (state: Web3ModalState) => void) {
    return super.subscribeState(state =>
      callback({
        ...state,
        selectedNetworkId: NetworkUtil.caipNetworkIdToNumber(state.selectedNetworkId)
      })
    )
  }

  public getAddress() {
    const { address } = EthersStoreUtil.state

    return address ? getOriginalAddress(address) : undefined
  }

  public getError() {
    return EthersStoreUtil.state.error
  }

  public getChainId() {
    return EthersStoreUtil.state.chainId
  }

  public getIsConnected() {
    return EthersStoreUtil.state.isConnected
  }

  public getWalletProvider() {
    return EthersStoreUtil.state.provider as Eip1193Provider | undefined
  }

  public getWalletProviderType() {
    return EthersStoreUtil.state.providerType
  }

  public subscribeProvider(callback: (newState: EthersStoreUtilState) => void) {
    return EthersStoreUtil.subscribe(callback)
  }

  public disconnect() {
    const connectorId = localStorage.getItem(EthersConstantsUtil.WALLET_ID)
    const connector = this.getConnectors().find(c => c.id === connectorId)
    connector?.disconnect?.()
    localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
    EthersStoreUtil.reset()
  }

  // -- Private -----------------------------------------------------------------
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
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? [])
  }

  private async setEmailProvider() {
    window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.EMAIL_CONNECTOR_ID)

    if (this.emailProvider) {
      const { address, chainId, smartAccountDeployed, preferredAccountType } =
        await this.emailProvider.connect({ chainId: this.getChainId() })

      const { smartAccountEnabledNetworks } =
        await this.emailProvider.getSmartAccountEnabledNetworks()

      this.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks)
      if (address && chainId) {
        EthersStoreUtil.setChainId(chainId)
        EthersStoreUtil.setProviderType(ConstantsUtil.EMAIL_CONNECTOR_ID as 'w3mEmail')
        EthersStoreUtil.setProvider(this.emailProvider as unknown as CombinedProvider)
        EthersStoreUtil.setIsConnected(true)
        EthersStoreUtil.setAddress(address as Address)
        EthersStoreUtil.setPreferredAccountType(preferredAccountType as W3mFrameTypes.AccountType)
        this.setSmartAccountDeployed(Boolean(smartAccountDeployed))

        this.watchEmail()
        this.watchModal()
      }
      super.setLoading(false)
    }
  }

  private watchEmail() {
    if (this.emailProvider) {
      this.emailProvider.onRpcRequest(request => {
        if (W3mFrameHelpers.checkIfRequestExists(request)) {
          if (!W3mFrameHelpers.checkIfRequestIsAllowed(request)) {
            if (super.isOpen()) {
              if (!super.isTransactionStackEmpty()) {
                super.redirect('ApproveTransaction')
              }
            } else {
              super.open({ view: 'ApproveTransaction' })
            }
          }
        } else {
          super.open()
          const method = W3mFrameHelpers.getRequestMethod(request)
          // eslint-disable-next-line no-console
          console.error(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_MESSAGE, { method })
          setTimeout(() => {
            this.showErrorMessage(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_UI_MESSAGE)
          }, 300)
        }
      })
      this.emailProvider.onRpcResponse(response => {
        const responseType = W3mFrameHelpers.getResponseType(response)

        switch (responseType) {
          case W3mFrameConstants.RPC_RESPONSE_TYPE_ERROR: {
            const isModalOpen = super.isOpen()

            if (isModalOpen) {
              if (super.isTransactionStackEmpty()) {
                super.close()
              } else {
                super.popTransactionStack(true)
              }
            }
            break
          }
          case W3mFrameConstants.RPC_RESPONSE_TYPE_TX: {
            if (super.isTransactionStackEmpty()) {
              super.close()
            } else {
              super.popTransactionStack()
            }
            break
          }
          default:
            break
        }
      })
      this.emailProvider.onNotConnected(() => {
        this.setIsConnected(false)
        super.setLoading(false)
      })
      this.emailProvider.onIsConnected(({ preferredAccountType }) => {
        this.setIsConnected(true)
        super.setLoading(false)
        EthersStoreUtil.setPreferredAccountType(preferredAccountType as W3mFrameTypes.AccountType)
      })

      this.emailProvider.onSetPreferredAccount(({ address, type }) => {
        if (!address) {
          return
        }
        const chainId = NetworkUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id)
        EthersStoreUtil.setAddress(address as Address)
        EthersStoreUtil.setChainId(chainId)
        EthersStoreUtil.setIsConnected(true)
        EthersStoreUtil.setPreferredAccountType(type as W3mFrameTypes.AccountType)
        this.syncAccount()
      })
    }
  }

  private watchModal() {
    if (this.emailProvider) {
      this.subscribeState(val => {
        if (!val.open) {
          this.emailProvider?.rejectRpcRequest()
        }
      })
    }
  }

  private async syncAccount() {
    const address = EthersStoreUtil.state.address
    const chainId = EthersStoreUtil.state.chainId
    const isConnected = EthersStoreUtil.state.isConnected
    const preferredAccountType = EthersStoreUtil.state.preferredAccountType

    this.resetAccount()

    if (isConnected && address && chainId) {
      const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`

      this.setIsConnected(isConnected)
      this.setPreferredAccountType(preferredAccountType)
      this.setCaipAddress(caipAddress)
      this.syncConnectedWalletInfo()
      await Promise.all([
        this.syncProfile(address),
        this.syncBalance(address),
        this.getApprovedCaipNetworksData()
      ])

      this.hasSyncedConnectedAccount = true
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.resetWcConnection()
      this.resetNetwork()
    }
  }

  private async syncNetwork(chainImages?: Web3ModalClientOptions['chainImages']) {
    const address = EthersStoreUtil.state.address
    const chainId = EthersStoreUtil.state.chainId
    const isConnected = EthersStoreUtil.state.isConnected
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (chain) {
        const caipChainId: CaipNetworkId = `${ConstantsUtil.EIP155}:${chain.chainId}`

        this.setCaipNetwork({
          id: caipChainId,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId]
        })
        if (isConnected && address) {
          const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`
          this.setCaipAddress(caipAddress)
          if (chain.explorerUrl) {
            const url = `${chain.explorerUrl}/address/${address}`
            this.setAddressExplorerUrl(url)
          } else {
            this.setAddressExplorerUrl(undefined)
          }
          if (this.hasSyncedConnectedAccount) {
            await this.syncProfile(address)
            await this.syncBalance(address)
          }
        }
      } else if (isConnected) {
        this.setCaipNetwork({
          id: `${ConstantsUtil.EIP155}:${chainId}`
        })
      }
    }
  }

  private async syncProfile(address: string) {
    const chainId = EthersStoreUtil.state.chainId

    try {
      const { name, avatar } = await this.fetchIdentity({
        address
      })
      this.setProfileName(name)
      this.setProfileImage(avatar)
    } catch {
      if (chainId === 1) {
        const ensProvider = new InfuraProvider('mainnet')
        const name = await ensProvider.lookupAddress(address)
        const avatar = await ensProvider.getAvatar(address)

        if (name) {
          this.setProfileName(name)
        }
        if (avatar) {
          this.setProfileImage(avatar)
        }
      } else {
        this.setProfileName(null)
        this.setProfileImage(null)
      }
    }
  }

  private async syncBalance(address: string) {
    const chainId = EthersStoreUtil.state.chainId
    if (chainId && this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (chain) {
        const jsonRpcProvider = new JsonRpcProvider(chain.rpcUrl, {
          chainId,
          name: chain.name
        })
        if (jsonRpcProvider) {
          const balance = await jsonRpcProvider.getBalance(address)
          const formattedBalance = formatEther(balance)

          this.setBalance(formattedBalance, chain.currency)
        }
      }
    }
  }

  private syncConnectedWalletInfo() {
    const currentActiveWallet = window?.localStorage.getItem(EthersConstantsUtil.WALLET_ID)
    const providerType = EthersStoreUtil.state.providerType

    if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID) {
      if (currentActiveWallet) {
        const currentProvider = this.EIP6963Providers.find(
          provider => provider.info.name === currentActiveWallet
        )

        if (currentProvider) {
          this.setConnectedWalletInfo({
            ...currentProvider.info
          })
        }
      }
    } else if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
      const provider = EthersStoreUtil.state.provider as unknown as EthereumProvider

      if (provider.session) {
        this.setConnectedWalletInfo({
          ...provider.session.peer.metadata,
          name: provider.session.peer.metadata.name,
          icon: provider.session.peer.metadata.icons?.[0]
        })
      }
    } else if (currentActiveWallet) {
      this.setConnectedWalletInfo({
        name: currentActiveWallet
      })
    }
  }

  public async switchNetwork(chainId: number) {
    const provider = EthersStoreUtil.state.provider
    const providerType = EthersStoreUtil.state.providerType
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId)

      if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID && chain) {
        const WalletConnectProvider = provider as unknown as EthereumProvider

        if (WalletConnectProvider) {
          try {
            await WalletConnectProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
            })

            EthersStoreUtil.setChainId(chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await EthersHelpersUtil.addEthereumChain(
                WalletConnectProvider as unknown as Provider,
                chain
              )
            } else {
              throw new Error('Chain is not supported')
            }
          }
        }
      } else if (providerType === ConstantsUtil.COINBASE_CONNECTOR_ID && chain) {
        const CoinbaseProvider = provider
        if (CoinbaseProvider) {
          try {
            await CoinbaseProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
            })
            EthersStoreUtil.setChainId(chain.chainId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (switchError: any) {
            if (
              switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await EthersHelpersUtil.addEthereumChain(CoinbaseProvider, chain)
            }
          }
        }
      } else if (providerType === ConstantsUtil.EMAIL_CONNECTOR_ID) {
        if (this.emailProvider && chain?.chainId) {
          try {
            await this.emailProvider.switchNetwork(chain?.chainId)
            EthersStoreUtil.setChainId(chain.chainId)

            const { address, preferredAccountType } = await this.emailProvider.connect({
              chainId: chain?.chainId
            })

            EthersStoreUtil.setAddress(address as Address)
            EthersStoreUtil.setPreferredAccountType(
              preferredAccountType as W3mFrameTypes.AccountType
            )
            await this.syncAccount()
          } catch {
            throw new Error('Switching chain failed')
          }
        }
      }
    }
  }

  private syncConnectors(config: ProviderType) {
    const w3mConnectors: Connector[] = []

    const connectorType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]
    if (connectorType) {
      w3mConnectors.push({
        id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
        explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        imageUrl: this.options?.connectorImages?.[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        type: connectorType
      })
    }

    if (config.injected) {
      const injectedConnectorType =
        PresetsUtil.ConnectorTypesMap[ConstantsUtil.INJECTED_CONNECTOR_ID]
      if (injectedConnectorType) {
        w3mConnectors.push({
          id: ConstantsUtil.INJECTED_CONNECTOR_ID,
          explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.INJECTED_CONNECTOR_ID],
          imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.INJECTED_CONNECTOR_ID],
          imageUrl: this.options?.connectorImages?.[ConstantsUtil.INJECTED_CONNECTOR_ID],
          name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.INJECTED_CONNECTOR_ID],
          type: injectedConnectorType
        })
      }
    }

    if (config.coinbase) {
      w3mConnectors.push({
        id: ConstantsUtil.COINBASE_CONNECTOR_ID,
        explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.COINBASE_CONNECTOR_ID],
        imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.COINBASE_CONNECTOR_ID],
        imageUrl: this.options?.connectorImages?.[ConstantsUtil.COINBASE_CONNECTOR_ID],
        name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.COINBASE_CONNECTOR_ID],
        type: 'EXTERNAL'
      })
    }

    this.setConnectors(w3mConnectors)
  }

  private async syncEmailConnector(projectId: string) {
    if (typeof window !== 'undefined') {
      this.emailProvider = new W3mFrameProvider(projectId)

      this.addConnector({
        id: ConstantsUtil.EMAIL_CONNECTOR_ID,
        type: 'EMAIL',
        name: 'Email',
        provider: this.emailProvider
      })

      super.setLoading(true)
      const isLoginEmailUsed = this.emailProvider.getLoginEmailUsed()
      super.setLoading(isLoginEmailUsed)
      const { isConnected } = await this.emailProvider.isConnected()
      if (isConnected) {
        await this.setEmailProvider()
      } else {
        super.setLoading(false)
      }
    }
  }

  private eip6963EventHandler(event: CustomEventInit<EIP6963ProviderDetail>) {
    if (event.detail) {
      const { info, provider } = event.detail
      const connectors = this.getConnectors()
      const existingConnector = connectors.find(c => c.id === info.rdns)

      if (!existingConnector) {
        this.addConnector(new EIP6963Connector({ info, provider }))
      }
    }
  }

  private listenConnectors(enableEIP6963: boolean) {
    if (typeof window !== 'undefined' && enableEIP6963) {
      const handler = this.eip6963EventHandler.bind(this)
      window.addEventListener(ConstantsUtil.EIP6963_ANNOUNCE_EVENT, handler)
      window.dispatchEvent(new Event(ConstantsUtil.EIP6963_REQUEST_EVENT))
    }
  }
}
