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
import {
  ADD_CHAIN_METHOD,
  COINBASE_CONNECTOR_ID,
  EIP6963_ANNOUNCE_EVENT,
  EIP6963_CONNECTOR_ID,
  EIP6963_REQUEST_EVENT,
  INJECTED_CONNECTOR_ID,
  NAMESPACE,
  VERSION,
  WALLET_CONNECT_CONNECTOR_ID,
  WALLET_ID,
  ConnectorExplorerIds,
  ConnectorImageIds,
  ConnectorNamesMap,
  ConnectorTypesMap,
  NetworkBlockExplorerUrls,
  NetworkImageIds,
  NetworkNames,
  NetworkRPCUrls,
  networkCurrenySymbols
} from '@web3modal/utils'
import type EthereumProvider from '@walletconnect/ethereum-provider'
import {
  caipNetworkIdToNumber,
  getEthersCaipDefaultChain,
  getCaipTokens,
  hexStringToNumber
} from '@web3modal/utils'
import type { Address, ProviderType } from './utils/types.js'
import { ethers, utils } from 'ethers'
import { ProviderController } from './store/index.js'

// -- Types ---------------------------------------------------------------------
export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  ethersConfig: ProviderType
  chains?: number[]
  defaultChain?: number
  chainImages?: Record<number, string>
  tokens?: Record<number, Token>
  enableEIP6963?: boolean
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
  provider: ethers.providers.Web3Provider
}

interface ExternalProvider extends EthereumProvider {
  _addresses?: string[]
}

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  private hasSyncedConnectedAccount = false

  public constructor(options: Web3ModalClientOptions) {
    const {
      ethersConfig,
      chains,
      defaultChain,
      tokens,
      chainImages,
      _sdkVersion,
      enableEIP6963,
      ...w3mOptions
    } = options

    if (!ethersConfig) {
      throw new Error('web3modal:constructor - ethersConfig is undefined')
    }

    if (!w3mOptions.projectId) {
      throw new Error('web3modal:constructor - projectId is undefined')
    }

    if (!ethersConfig.walletConnect) {
      throw new Error('web3modal:constructor - WalletConnectConnector is required')
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = caipNetworkIdToNumber(caipNetwork?.id)
        if (chainId) {
          await this.switchNetwork(chainId)
        }
      },

      getApprovedCaipNetworksData(): Promise<{
        approvedCaipNetworkIds: `${string}:${string}`[] | undefined
        supportsAllNetworks: boolean
      }> {
        return new Promise(resolve => {
          const walletChoice = localStorage.getItem(WALLET_ID)

          if (walletChoice?.includes(WALLET_CONNECT_CONNECTOR_ID)) {
            const connector = ethersConfig.walletConnect
            if (!connector) {
              throw new Error(
                'networkControllerClient:getApprovedCaipNetworks - connector is undefined'
              )
            }
            const ns = (ethersConfig.walletConnect?.provider as EthereumProvider).signer?.session
              ?.namespaces
            const nsMethods = ns?.[NAMESPACE]?.methods
            const nsChains = ns?.[NAMESPACE]?.chains

            const result = {
              supportsAllNetworks: nsMethods?.includes(ADD_CHAIN_METHOD) ?? false,
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
    }

    const connectionControllerClient: ConnectionControllerClient = {
      connectWalletConnect: async onUri => {
        const connector = ethersConfig.walletConnect
        if (!connector) {
          throw new Error('connectionControllerClient:getWalletConnectUri - connector is undefined')
        }

        const walletConnectProvider = connector.provider as EthereumProvider

        walletConnectProvider.on('display_uri', (uri: string) => {
          onUri(uri)
        })

        await walletConnectProvider.connect().then(() => {
          this.setWalletConnectProvider(ethersConfig)
        })
      },

      connectExternal: async ({ id, info, provider }) => {
        if (id === INJECTED_CONNECTOR_ID) {
          const injectedProvider = ethersConfig.injected
          if (!injectedProvider) {
            throw new Error('connectionControllerClient:connectInjected - connector is undefined')
          }
          await injectedProvider.send('eth_requestAccounts', []).then(() => {
            this.setInjectedProvider(ethersConfig)
          })
        } else if (id === EIP6963_CONNECTOR_ID && info && provider) {
          const EIP6963Provider = provider as ethers.providers.Web3Provider
          const EIP6963Info = info as Info

          await EIP6963Provider.send('eth_requestAccounts', []).then(() => {
            this.setEIP6963Provider(EIP6963Provider, EIP6963Info.name)
          })
        } else if (id === COINBASE_CONNECTOR_ID) {
          const coinbaseProvider = ethersConfig.coinbase
          if (!coinbaseProvider) {
            throw new Error('connectionControllerClient:connectCoinbase - connector is undefined')
          }
          await coinbaseProvider.send('eth_requestAccounts', []).then(() => {
            this.setCoinbaseProvider(ethersConfig)
          })
        }
      },

      checkInstalled(ids) {
        if (!ids) {
          return Boolean(window.ethereum)
        }

        if (ethersConfig.injected) {
          if (!window?.ethereum) {
            return false
          }
        }

        return ids.some(id => Boolean(window.ethereum?.[String(id)]))
      },

      disconnect: async () => {
        const provider = ProviderController.state.provider
        const providerType = ProviderController.state.providerType
        if (providerType === WALLET_CONNECT_CONNECTOR_ID) {
          const walletConnectProvider = provider?.provider as EthereumProvider
          await walletConnectProvider.disconnect()
          localStorage.removeItem(WALLET_ID)
          ProviderController.reset()
        } else {
          localStorage.removeItem(WALLET_ID)
          ProviderController.reset()
        }
      }
    }

    super({
      networkControllerClient,
      connectionControllerClient,
      defaultChain: getEthersCaipDefaultChain(defaultChain),
      tokens: getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `html-ethers-5-${VERSION}`,
      ...w3mOptions
    })

    ProviderController.subscribeKey('address', () => {
      this.syncAccount()
    })

    ProviderController.subscribeKey('chainId', () => {
      this.syncNetwork(chainImages)
    })

    this.syncRequestedNetworks(chains, chainImages)
    this.syncConnectors(ethersConfig)

    if (enableEIP6963) {
      this.listenConnectors(enableEIP6963)
      this.privateCheckActive6963Provider()
    }

    this.watchWalletConnect(ethersConfig)

    if (ethersConfig.injected) {
      this.watchInjected(ethersConfig)
    }
    if (ethersConfig.coinbase) {
      this.watchCoinbase(ethersConfig)
    }
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
  private syncRequestedNetworks(
    chains: Web3ModalClientOptions['chains'],
    chainImages?: Web3ModalClientOptions['chainImages']
  ) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `${NAMESPACE}:${chain}`,
          name: NetworkNames[chain],
          imageId: NetworkImageIds[chain],
          imageUrl: chainImages?.[chain]
        }) as CaipNetwork
    )
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? [])
  }

  privateCheckActive6963Provider() {
    const currentActiveWallet = window?.localStorage.getItem(WALLET_ID)
    if (currentActiveWallet) {
      const EIP6963Provider = ProviderController.state.EIP6963Providers
      const currentProvider = EIP6963Provider.find(
        provider => provider.name === currentActiveWallet
      )
      if (currentProvider) {
        this.setEIP6963Provider(currentProvider.provider, currentProvider.name)
      }
    }
  }

  private setWalletConnectProvider(config: ProviderType) {
    window?.localStorage.setItem(WALLET_ID, WALLET_CONNECT_CONNECTOR_ID)
    const walletConnectProvider = config.walletConnect?.provider as EthereumProvider
    if (walletConnectProvider) {
      ProviderController.setChainId(walletConnectProvider.chainId)
      ProviderController.setProviderType('walletConnect')
      ProviderController.setProvider(config.walletConnect)
      ProviderController.setIsConnected(true)
      ProviderController.setAddress(walletConnectProvider.accounts[0] as Address)
    }
  }

  private async setInjectedProvider(config: ProviderType) {
    window?.localStorage.setItem(WALLET_ID, INJECTED_CONNECTOR_ID)
    const injectedProvider = config.injected

    if (injectedProvider) {
      const signer = injectedProvider.getSigner()
      const chainId = await signer.getChainId()
      const address = await signer.getAddress()
      if (address && chainId) {
        ProviderController.setChainId(chainId)
        ProviderController.setProviderType('injected')
        ProviderController.setProvider(config.injected)
        ProviderController.setIsConnected(true)
        ProviderController.setAddress(address as Address)
      }
    }
  }

  private async setEIP6963Provider(provider: ethers.providers.Web3Provider, name: string) {
    window?.localStorage.setItem(WALLET_ID, name)

    if (provider) {
      const signer = provider.getSigner()
      const chainId = await signer.getChainId()
      const address = await signer.getAddress()
      if (address && chainId) {
        ProviderController.setChainId(chainId)
        ProviderController.setProviderType('eip6963')
        ProviderController.setProvider(provider)
        ProviderController.setIsConnected(true)
        ProviderController.setAddress(address as Address)
        this.watchEIP6963(provider)
      }
    }
  }

  private async setCoinbaseProvider(config: ProviderType) {
    window?.localStorage.setItem(WALLET_ID, COINBASE_CONNECTOR_ID)
    const coinbaseProvider = config.coinbase

    if (coinbaseProvider) {
      const signer = coinbaseProvider.getSigner()
      const chainId = await signer.getChainId()
      const address = await signer.getAddress()
      if (address && chainId) {
        ProviderController.setChainId(chainId)
        ProviderController.setProviderType('coinbaseWallet')
        ProviderController.setProvider(config.coinbase)
        ProviderController.setIsConnected(true)
        ProviderController.setAddress(address as Address)
      }
    }
  }

  private watchWalletConnect(config: ProviderType) {
    const walletConnectProvider = config.walletConnect?.provider as EthereumProvider
    const walletId = localStorage.getItem(WALLET_ID)

    if (walletConnectProvider) {
      if (walletId === WALLET_CONNECT_CONNECTOR_ID) {
        this.setWalletConnectProvider(config)
      }

      walletConnectProvider.on('disconnect', () => {
        localStorage.removeItem(WALLET_ID)
        ProviderController.reset()
      })

      walletConnectProvider.on('accountsChanged', accounts => {
        if (accounts.length > 0) {
          this.setWalletConnectProvider(config)
        }
      })

      walletConnectProvider.on('chainChanged', chainId => {
        if (chainId) {
          const chain = hexStringToNumber(chainId)
          ProviderController.setChainId(chain)
        }
      })
    }
  }

  private watchInjected(config: ProviderType) {
    const injectedProvider = config.injected?.provider as EthereumProvider
    const walletId = localStorage.getItem(WALLET_ID)

    if (injectedProvider) {
      if (walletId === INJECTED_CONNECTOR_ID) {
        this.setInjectedProvider(config)
      }

      injectedProvider.on('accountsChanged', accounts => {
        if (accounts.length === 0) {
          localStorage.removeItem(WALLET_ID)
          ProviderController.reset()
        } else {
          ProviderController.setAddress(accounts[0] as Address)
        }
      })

      injectedProvider.on('chainChanged', chainId => {
        if (chainId) {
          const chain = typeof chainId === 'string' ? hexStringToNumber(chainId) : Number(chainId)
          ProviderController.setChainId(chain)
        }
      })
    }
  }

  private watchEIP6963(provider: ethers.providers.Web3Provider) {
    const EIP6963Provider = provider.provider as ExternalProvider
    if (EIP6963Provider) {
      EIP6963Provider.on('accountsChanged', accounts => {
        if (accounts.length === 0) {
          localStorage.removeItem(WALLET_ID)
          ProviderController.reset()
        } else {
          ProviderController.setAddress(accounts[0] as Address)
        }
      })

      EIP6963Provider.on('disconnect', () => {
        localStorage.removeItem(WALLET_ID)
        ProviderController.reset()
      })

      EIP6963Provider.on('chainChanged', chainId => {
        if (chainId) {
          const chain = typeof chainId === 'string' ? hexStringToNumber(chainId) : Number(chainId)
          ProviderController.setChainId(chain)
        }
      })
    }
  }

  private watchCoinbase(config: ProviderType) {
    const coinbaseProvider = config.coinbase?.provider as ExternalProvider
    const walletId = localStorage.getItem(WALLET_ID)

    if (coinbaseProvider) {
      if (walletId === COINBASE_CONNECTOR_ID) {
        if (coinbaseProvider._addresses && coinbaseProvider._addresses?.length > 0) {
          this.setCoinbaseProvider(config)
        } else {
          localStorage.removeItem(WALLET_ID)
          ProviderController.reset()
        }
      }

      coinbaseProvider.on('accountsChanged', accounts => {
        if (accounts.length === 0) {
          localStorage.removeItem(WALLET_ID)
          ProviderController.reset()
        } else {
          ProviderController.setAddress(accounts[0] as Address)
        }
      })

      coinbaseProvider.on('chainChanged', chainId => {
        if (chainId && walletId === COINBASE_CONNECTOR_ID) {
          const chain = Number(chainId)
          ProviderController.setChainId(chain)
        }
      })
    }
  }

  private async syncAccount() {
    const address = ProviderController.state.address
    const chainId = ProviderController.state.chainId
    const isConnected = ProviderController.state.isConnected

    this.resetAccount()

    if (isConnected && address && chainId) {
      const caipAddress: CaipAddress = `${NAMESPACE}:${chainId}:${address}`

      this.setIsConnected(isConnected)

      this.setCaipAddress(caipAddress)
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
    const address = ProviderController.state.address
    const chainId = ProviderController.state.chainId
    const isConnected = ProviderController.state.isConnected
    if (chainId) {
      const caipChainId: CaipNetworkId = `${NAMESPACE}:${chainId}`

      this.setCaipNetwork({
        id: caipChainId,
        name: NetworkNames[chainId],
        imageId: NetworkImageIds[chainId],
        imageUrl: chainImages?.[chainId]
      })
      if (isConnected && address) {
        const caipAddress: CaipAddress = `${NAMESPACE}:${chainId}:${address}`
        this.setCaipAddress(caipAddress)
        if (NetworkBlockExplorerUrls[chainId]) {
          const url = `${NetworkBlockExplorerUrls[chainId]}/address/${address}`
          this.setAddressExplorerUrl(url)
        } else {
          this.setAddressExplorerUrl(undefined)
        }
        if (this.hasSyncedConnectedAccount) {
          await this.syncBalance(address)
        }
      }
    }
  }

  private async syncProfile(address: Address) {
    const ensProvider = new ethers.providers.InfuraProvider('mainnet')
    const name = await ensProvider.lookupAddress(address)
    const avatar = await ensProvider.getAvatar(address)
    if (name) {
      this.setProfileName(name)
    }
    if (avatar) {
      this.setProfileImage(avatar)
    }
  }

  private async syncBalance(address: Address) {
    const chainId = ProviderController.state.chainId
    if (chainId) {
      const networkRpcUrl = NetworkRPCUrls[chainId]
      const networkName = NetworkNames[chainId]
      const networkCurreny = networkCurrenySymbols[chainId]

      if (networkRpcUrl && networkName && networkCurreny) {
        const JsonRpcProvider = new ethers.providers.JsonRpcProvider(NetworkRPCUrls[chainId], {
          chainId,
          name: networkName
        })
        if (JsonRpcProvider) {
          const balance = await JsonRpcProvider.getBalance(address)
          const formattedBalance = utils.formatEther(balance)
          this.setBalance(formattedBalance, networkCurreny)
        }
      }
    }
  }

  private async switchNetwork(chainId: number) {
    const provider = ProviderController.state.provider
    const providerType = ProviderController.state.providerType

    if (providerType === WALLET_CONNECT_CONNECTOR_ID) {
      const walletConnectProvider = provider?.provider as EthereumProvider
      if (walletConnectProvider) {
        try {
          await walletConnectProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }]
          })
          ProviderController.setChainId(chainId)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (switchError: any) {
          if (switchError.code === 4902 || switchError.code === 5000) {
            await walletConnectProvider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${chainId.toString(16)}`,
                  rpcUrls: [NetworkRPCUrls[chainId]],
                  chainName: NetworkNames[chainId],
                  nativeCurrency: {
                    name: networkCurrenySymbols[chainId],
                    decimals: 18,
                    symbol: networkCurrenySymbols[chainId]
                  },
                  blockExplorerUrls: [NetworkBlockExplorerUrls[chainId]],
                  iconUrls: [NetworkImageIds[chainId]]
                }
              ]
            })
          } else {
            throw new Error('Chain is not supported')
          }
        }
      }
    } else if (providerType === INJECTED_CONNECTOR_ID) {
      const injectedProvider = provider
      if (injectedProvider) {
        try {
          await injectedProvider.send('wallet_switchEthereumChain', [
            { chainId: `0x${chainId.toString(16)}` }
          ])
          ProviderController.setChainId(chainId)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (switchError: any) {
          if (switchError.code === 4902 || switchError.code === 5000) {
            await injectedProvider.send('wallet_addEthereumChain', [
              {
                chainId: `0x${chainId.toString(16)}`,
                rpcUrls: [NetworkRPCUrls[chainId]],
                chainName: NetworkNames[chainId],
                nativeCurrency: {
                  name: networkCurrenySymbols[chainId],
                  decimals: 18,
                  symbol: networkCurrenySymbols[chainId]
                },
                blockExplorerUrls: [NetworkBlockExplorerUrls[chainId]],
                iconUrls: [NetworkImageIds[chainId]]
              }
            ])
          } else {
            throw new Error('Chain is not supported')
          }
        }
      }
    } else if (providerType === EIP6963_CONNECTOR_ID) {
      const EIP6963Provider = provider

      if (EIP6963Provider) {
        try {
          await EIP6963Provider.send('wallet_switchEthereumChain', [
            { chainId: `0x${chainId.toString(16)}` }
          ])
          ProviderController.setChainId(chainId)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (switchError: any) {
          if (switchError.code === 4902 || switchError.code === 5000) {
            await EIP6963Provider.send('wallet_addEthereumChain', [
              {
                chainId: `0x${chainId.toString(16)}`,
                rpcUrls: [NetworkRPCUrls[chainId]],
                chainName: NetworkNames[chainId],
                nativeCurrency: {
                  name: networkCurrenySymbols[chainId],
                  decimals: 18,
                  symbol: networkCurrenySymbols[chainId]
                },
                blockExplorerUrls: [NetworkBlockExplorerUrls[chainId]],
                iconUrls: [NetworkImageIds[chainId]]
              }
            ])
          } else {
            throw new Error('Chain is not supported')
          }
        }
      }
    } else if (providerType === COINBASE_CONNECTOR_ID) {
      const coinbaseProvider = provider
      if (coinbaseProvider) {
        try {
          await coinbaseProvider.send('wallet_switchEthereumChain', [
            { chainId: `0x${chainId.toString(16)}` }
          ])
          ProviderController.setChainId(chainId)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (switchError: any) {
          if (switchError.code === 4902 || switchError.code === 5000) {
            await coinbaseProvider.send('wallet_addEthereumChain', [
              {
                chainId: `0x${chainId.toString(16)}`,
                rpcUrls: [NetworkRPCUrls[chainId]],
                chainName: NetworkNames[chainId],
                nativeCurrency: {
                  name: networkCurrenySymbols[chainId],
                  decimals: 18,
                  symbol: networkCurrenySymbols[chainId]
                },
                blockExplorerUrls: [NetworkBlockExplorerUrls[chainId]],
                iconUrls: [NetworkImageIds[chainId]]
              }
            ])
          }
        }
      }
    }
  }

  private syncConnectors(config: ProviderType) {
    const w3mConnectors: Connector[] = []

    if (config.walletConnect) {
      const connectorType = ConnectorTypesMap[WALLET_CONNECT_CONNECTOR_ID]
      if (connectorType) {
        w3mConnectors.push({
          id: WALLET_CONNECT_CONNECTOR_ID,
          explorerId: ConnectorExplorerIds[WALLET_CONNECT_CONNECTOR_ID],
          imageId: ConnectorImageIds[WALLET_CONNECT_CONNECTOR_ID],
          name: ConnectorNamesMap[WALLET_CONNECT_CONNECTOR_ID],
          type: connectorType
        })
      }
    }

    if (config.injected) {
      const connectorType = ConnectorTypesMap[INJECTED_CONNECTOR_ID]
      if (connectorType) {
        w3mConnectors.push({
          id: INJECTED_CONNECTOR_ID,
          explorerId: ConnectorExplorerIds[INJECTED_CONNECTOR_ID],
          imageId: ConnectorImageIds[INJECTED_CONNECTOR_ID],
          name: ConnectorNamesMap[INJECTED_CONNECTOR_ID],
          type: connectorType
        })
      }

      if (config.coinbase) {
        w3mConnectors.push({
          id: COINBASE_CONNECTOR_ID,
          explorerId: ConnectorExplorerIds[COINBASE_CONNECTOR_ID],
          imageId: ConnectorImageIds[COINBASE_CONNECTOR_ID],
          name: ConnectorNamesMap[COINBASE_CONNECTOR_ID],
          type: 'EXTERNAL'
        })
      }

      this.setConnectors(w3mConnectors)
    }
  }

  private listenConnectors(enableEIP6963: boolean) {
    if (typeof window !== 'undefined' && enableEIP6963) {
      window.addEventListener(EIP6963_ANNOUNCE_EVENT, (event: CustomEventInit<Wallet>) => {
        if (event.detail) {
          const { info, provider } = event.detail
          const eip6963Provider = provider as unknown as ExternalProvider
          const web3provider = new ethers.providers.Web3Provider(eip6963Provider)
          const type = ConnectorTypesMap[EIP6963_CONNECTOR_ID]

          if (type) {
            this.addConnector({
              id: EIP6963_CONNECTOR_ID,
              type,
              imageUrl: info.icon,
              name: info.name,
              provider: web3provider,
              info
            })

            const name = info.name
            const eip6963ProviderObj = {
              name,
              provider: web3provider
            }
            ProviderController.add6963Provider(eip6963ProviderObj)
          }
        }
      })
      window.dispatchEvent(new Event(EIP6963_REQUEST_EVENT))
    }
  }
}
