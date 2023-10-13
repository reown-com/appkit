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
import { ConstantsUtil, PresetsUtil, HelpersUtil } from '@web3modal/utils'

import type EthereumProvider from '@walletconnect/ethereum-provider'

import type { Address, ProviderType } from './utils/types.js'
import { ethers, utils } from 'ethers'
import { ProviderController } from './controllers/ProviderController.js'
import {
  addEthereumChain,
  getCaipDefaultChain,
  hexStringToNumber,
  numberToHexString
} from './utils/helpers.js'
import {
  NetworkNames,
  NetworkBlockExplorerUrls,
  networkCurrenySymbols,
  NetworkRPCUrls
} from './utils/presets.js'
import {
  ERROR_CODE_DEFAULT,
  ERROR_CODE_UNRECOGNIZED_CHAIN_ID,
  WALLET_ID
} from './utils/constants.js'

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
        const chainId = HelpersUtil.caipNetworkIdToNumber(caipNetwork?.id)
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

          if (walletChoice?.includes(ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID)) {
            const connector = ethersConfig.walletConnect
            if (!connector) {
              throw new Error(
                'networkControllerClient:getApprovedCaipNetworks - connector is undefined'
              )
            }
            const ns = (ethersConfig.walletConnect?.provider as EthereumProvider).signer?.session
              ?.namespaces
            const nsMethods = ns?.[ConstantsUtil.NAMESPACE]?.methods
            const nsChains = ns?.[ConstantsUtil.NAMESPACE]?.chains

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
    }

    const connectionControllerClient: ConnectionControllerClient = {
      connectWalletConnect: async onUri => {
        const connector = ethersConfig.walletConnect
        if (!connector) {
          throw new Error('connectionControllerClient:getWalletConnectUri - connector is undefined')
        }

        const WalletConnectProvider = connector.provider as EthereumProvider

        WalletConnectProvider.on('display_uri', (uri: string) => {
          onUri(uri)
        })

        await WalletConnectProvider.connect()
        this.setWalletConnectProvider(ethersConfig)
      },

      connectExternal: async ({ id, info, provider }) => {
        if (id === ConstantsUtil.INJECTED_CONNECTOR_ID) {
          const InjectedProvider = ethersConfig.injected
          if (!InjectedProvider) {
            throw new Error('connectionControllerClient:connectInjected - connector is undefined')
          }
          await InjectedProvider.send('eth_requestAccounts', [])
          this.setInjectedProvider(ethersConfig)
        } else if (id === ConstantsUtil.EIP6963_CONNECTOR_ID && info && provider) {
          const EIP6963Provider = provider as ethers.providers.Web3Provider
          const EIP6963Info = info as Info

          await EIP6963Provider.send('eth_requestAccounts', [])
          this.setEIP6963Provider(EIP6963Provider, EIP6963Info.name)
        } else if (id === ConstantsUtil.COINBASE_CONNECTOR_ID) {
          const CoinbaseProvider = ethersConfig.coinbase
          if (!CoinbaseProvider) {
            throw new Error('connectionControllerClient:connectCoinbase - connector is undefined')
          }
          await CoinbaseProvider.send('eth_requestAccounts', [])
          this.setCoinbaseProvider(ethersConfig)
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
        if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
          const WalletConnectProvider = provider?.provider as EthereumProvider
          await WalletConnectProvider.disconnect()
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
      defaultChain: getCaipDefaultChain(defaultChain),
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `html-ethers-5-${ConstantsUtil.VERSION}`,
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
  private syncRequestedNetworks(
    chains: Web3ModalClientOptions['chains'],
    chainImages?: Web3ModalClientOptions['chainImages']
  ) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `${ConstantsUtil.NAMESPACE}:${chain}`,
          name: NetworkNames[chain],
          imageId: PresetsUtil.NetworkImageIds[chain],
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
    window?.localStorage.setItem(WALLET_ID, ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID)
    const WalletConnectProvider = config.walletConnect?.provider as EthereumProvider
    if (WalletConnectProvider) {
      ProviderController.setChainId(WalletConnectProvider.chainId)
      ProviderController.setProviderType('walletConnect')
      ProviderController.setProvider(config.walletConnect)
      ProviderController.setIsConnected(true)
      ProviderController.setAddress(WalletConnectProvider.accounts[0] as Address)
    }
  }

  private async setInjectedProvider(config: ProviderType) {
    window?.localStorage.setItem(WALLET_ID, ConstantsUtil.INJECTED_CONNECTOR_ID)
    const InjectedProvider = config.injected

    if (InjectedProvider) {
      const signer = InjectedProvider.getSigner()
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
    window?.localStorage.setItem(WALLET_ID, ConstantsUtil.COINBASE_CONNECTOR_ID)
    const CoinbaseProvider = config.coinbase

    if (CoinbaseProvider) {
      const signer = CoinbaseProvider.getSigner()
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
    const WalletConnectProvider = config.walletConnect?.provider as EthereumProvider
    const walletId = localStorage.getItem(WALLET_ID)

    if (WalletConnectProvider) {
      if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
        this.setWalletConnectProvider(config)
      }

      WalletConnectProvider.on('disconnect', () => {
        localStorage.removeItem(WALLET_ID)
        ProviderController.reset()
      })

      WalletConnectProvider.on('accountsChanged', accounts => {
        if (accounts.length > 0) {
          this.setWalletConnectProvider(config)
        }
      })

      WalletConnectProvider.on('chainChanged', chainId => {
        if (chainId) {
          const chain = hexStringToNumber(chainId)
          ProviderController.setChainId(chain)
        }
      })
    }
  }

  private watchInjected(config: ProviderType) {
    const InjectedProvider = config.injected?.provider as EthereumProvider
    const walletId = localStorage.getItem(WALLET_ID)

    if (InjectedProvider) {
      if (walletId === ConstantsUtil.INJECTED_CONNECTOR_ID) {
        this.setInjectedProvider(config)
      }

      InjectedProvider.on('accountsChanged', accounts => {
        if (accounts.length === 0) {
          localStorage.removeItem(WALLET_ID)
          ProviderController.reset()
        } else {
          ProviderController.setAddress(accounts[0] as Address)
        }
      })

      InjectedProvider.on('chainChanged', chainId => {
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
    const CoinbaseProvider = config.coinbase?.provider as ExternalProvider
    const walletId = localStorage.getItem(WALLET_ID)

    if (CoinbaseProvider) {
      if (walletId === ConstantsUtil.COINBASE_CONNECTOR_ID) {
        if (CoinbaseProvider._addresses && CoinbaseProvider._addresses?.length > 0) {
          this.setCoinbaseProvider(config)
        } else {
          localStorage.removeItem(WALLET_ID)
          ProviderController.reset()
        }
      }

      CoinbaseProvider.on('accountsChanged', accounts => {
        if (accounts.length === 0) {
          localStorage.removeItem(WALLET_ID)
          ProviderController.reset()
        } else {
          ProviderController.setAddress(accounts[0] as Address)
        }
      })

      CoinbaseProvider.on('chainChanged', chainId => {
        if (chainId && walletId === ConstantsUtil.COINBASE_CONNECTOR_ID) {
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
      const caipAddress: CaipAddress = `${ConstantsUtil.NAMESPACE}:${chainId}:${address}`

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
      const caipChainId: CaipNetworkId = `${ConstantsUtil.NAMESPACE}:${chainId}`

      this.setCaipNetwork({
        id: caipChainId,
        name: NetworkNames[chainId],
        imageId: PresetsUtil.NetworkImageIds[chainId],
        imageUrl: chainImages?.[chainId]
      })
      if (isConnected && address) {
        const caipAddress: CaipAddress = `${ConstantsUtil.NAMESPACE}:${chainId}:${address}`
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

    if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
      const WalletConnectProvider = provider?.provider as EthereumProvider

      if (WalletConnectProvider) {
        try {
          await WalletConnectProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: numberToHexString(chainId) }]
          })

          ProviderController.setChainId(chainId)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (switchError: any) {
          if (
            switchError.code === ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
            switchError.code === ERROR_CODE_DEFAULT
          ) {
            await addEthereumChain(
              WalletConnectProvider,
              chainId,
              ConstantsUtil.INJECTED_CONNECTOR_ID
            )
          } else {
            throw new Error('Chain is not supported')
          }
        }
      }
    } else if (providerType === ConstantsUtil.INJECTED_CONNECTOR_ID) {
      const InjectedProvider = provider
      if (InjectedProvider) {
        try {
          await InjectedProvider.send('wallet_switchEthereumChain', [
            { chainId: numberToHexString(chainId) }
          ])
          ProviderController.setChainId(chainId)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (switchError: any) {
          if (
            switchError.code === ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
            switchError.code === ERROR_CODE_DEFAULT
          ) {
            await addEthereumChain(InjectedProvider, chainId, ConstantsUtil.INJECTED_CONNECTOR_ID)
          } else {
            throw new Error('Chain is not supported')
          }
        }
      }
    } else if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID) {
      const EIP6963Provider = provider

      if (EIP6963Provider) {
        try {
          await EIP6963Provider.send('wallet_switchEthereumChain', [
            { chainId: numberToHexString(chainId) }
          ])
          ProviderController.setChainId(chainId)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (switchError: any) {
          if (
            switchError.code === ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
            switchError.code === ERROR_CODE_DEFAULT
          ) {
            await addEthereumChain(EIP6963Provider, chainId, ConstantsUtil.INJECTED_CONNECTOR_ID)
          } else {
            throw new Error('Chain is not supported')
          }
        }
      }
    } else if (providerType === ConstantsUtil.COINBASE_CONNECTOR_ID) {
      const CoinbaseProvider = provider
      if (CoinbaseProvider) {
        try {
          await CoinbaseProvider.send('wallet_switchEthereumChain', [
            { chainId: numberToHexString(chainId) }
          ])
          ProviderController.setChainId(chainId)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (switchError: any) {
          if (
            switchError.code === ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
            switchError.code === ERROR_CODE_DEFAULT
          ) {
            await addEthereumChain(CoinbaseProvider, chainId, ConstantsUtil.INJECTED_CONNECTOR_ID)
          }
        }
      }
    }
  }

  private syncConnectors(config: ProviderType) {
    const w3mConnectors: Connector[] = []

    if (config.walletConnect) {
      const connectorType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]
      if (connectorType) {
        w3mConnectors.push({
          id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
          explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
          imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
          name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
          type: connectorType
        })
      }
    }

    if (config.injected) {
      const connectorType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.INJECTED_CONNECTOR_ID]
      if (connectorType) {
        w3mConnectors.push({
          id: ConstantsUtil.INJECTED_CONNECTOR_ID,
          explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.INJECTED_CONNECTOR_ID],
          imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.INJECTED_CONNECTOR_ID],
          name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.INJECTED_CONNECTOR_ID],
          type: connectorType
        })
      }

      if (config.coinbase) {
        w3mConnectors.push({
          id: ConstantsUtil.COINBASE_CONNECTOR_ID,
          explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.COINBASE_CONNECTOR_ID],
          imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.COINBASE_CONNECTOR_ID],
          name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.COINBASE_CONNECTOR_ID],
          type: 'EXTERNAL'
        })
      }

      this.setConnectors(w3mConnectors)
    }
  }

  private listenConnectors(enableEIP6963: boolean) {
    if (typeof window !== 'undefined' && enableEIP6963) {
      window.addEventListener(
        ConstantsUtil.EIP6963_ANNOUNCE_EVENT,
        (event: CustomEventInit<Wallet>) => {
          if (event.detail) {
            const { info, provider } = event.detail
            const eip6963Provider = provider as unknown as ExternalProvider
            const web3provider = new ethers.providers.Web3Provider(eip6963Provider)
            const type = PresetsUtil.ConnectorTypesMap[ConstantsUtil.EIP6963_CONNECTOR_ID]

            if (type) {
              this.addConnector({
                id: ConstantsUtil.EIP6963_CONNECTOR_ID,
                type,
                imageUrl: info.icon,
                name: info.name,
                provider: web3provider,
                info
              })

              const eip6963ProviderObj = {
                name: info.name,
                provider: web3provider
              }
              ProviderController.add6963Provider(eip6963ProviderObj)
            }
          }
        }
      )
      window.dispatchEvent(new Event(ConstantsUtil.EIP6963_REQUEST_EVENT))
    }
  }
}
