/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import {
  connect,
  disconnect,
  signMessage,
  getBalance,
  getEnsAvatar as wagmiGetEnsAvatar,
  getEnsName,
  watchAccount,
  watchConnectors,
  estimateGas as wagmiEstimateGas,
  writeContract as wagmiWriteContract,
  getAccount,
  getEnsAddress as wagmiGetEnsAddress,
  reconnect,
  switchChain,
  waitForTransactionReceipt,
  getConnections,
  switchAccount,
  injected,
  createConfig,
  getConnectors
} from '@wagmi/core'
import { ChainController, ConstantsUtil as CoreConstantsUtil } from '@web3modal/core'
import type UniversalProvider from '@walletconnect/universal-provider'
import type { ChainAdapter } from '@web3modal/core'
import { prepareTransactionRequest, sendTransaction as wagmiSendTransaction } from '@wagmi/core'
import type { Chain } from '@wagmi/core/chains'
import { mainnet } from 'viem/chains'
import type {
  GetAccountReturnType,
  GetEnsAddressReturnType,
  Config,
  CreateConnectorFn,
  CreateConfigParameters
} from '@wagmi/core'
import type {
  ConnectionControllerClient,
  Connector,
  NetworkControllerClient,
  PublicStateControllerState,
  SendTransactionArgs,
  WriteContractArgs
} from '@web3modal/core'
import { formatUnits, parseUnits } from 'viem'
import type { Hex } from 'viem'
import { ConstantsUtil, PresetsUtil, HelpersUtil } from '@web3modal/scaffold-utils'
import {
  ConstantsUtil as CommonConstants,
  SafeLocalStorage,
  SafeLocalStorageKeys
} from '@web3modal/common'
import {
  convertToAppKitChains,
  getEmailCaipNetworks,
  getTransport,
  getWalletConnectCaipNetworks,
  requireCaipAddress
} from './utils/helpers.js'
import { W3mFrameHelpers, W3mFrameRpcConstants } from '@web3modal/wallet'
import type { W3mFrameProvider, W3mFrameTypes } from '@web3modal/wallet'
import { NetworkUtil } from '@web3modal/common'
import { normalize } from 'viem/ens'
import type { AppKitOptions } from '@web3modal/base'
import type { CaipAddress, CaipNetwork, ChainNamespace, AdapterType } from '@web3modal/common'
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common'
import type { AppKit } from '@web3modal/base'
import { walletConnect } from './connectors/UniversalConnector.js'
import { coinbaseWallet } from '@wagmi/connectors'
import { authConnector } from './connectors/AuthConnector.js'
import { ProviderUtil } from '@web3modal/base/store'

// -- Types ---------------------------------------------------------------------
export interface AdapterOptions<C extends Config>
  extends Pick<AppKitOptions, 'siweConfig' | 'enableEIP6963'> {
  wagmiConfig: C
  defaultNetwork?: Chain
}

const OPTIONAL_METHODS = [
  'eth_accounts',
  'eth_requestAccounts',
  'eth_sendRawTransaction',
  'eth_sign',
  'eth_signTransaction',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'eth_sendTransaction',
  'personal_sign',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
  'wallet_getPermissions',
  'wallet_requestPermissions',
  'wallet_registerOnboarding',
  'wallet_watchAsset',
  'wallet_scanQRCode'
]

// @ts-expect-error: Overridden state type is correct
interface Web3ModalState extends PublicStateControllerState {
  selectedNetworkId: number | undefined
}

// -- Client --------------------------------------------------------------------
export class EVMWagmiClient implements ChainAdapter {
  // -- Private variables -------------------------------------------------------
  private appKit: AppKit | undefined = undefined

  private createConfigParams?: Partial<CreateConfigParameters>

  // -- Public variables --------------------------------------------------------
  public options: AppKitOptions | undefined = undefined

  public chainNamespace: ChainNamespace = CommonConstantsUtil.CHAIN.EVM

  public caipNetworks?: CaipNetwork[]

  public wagmiChains?: readonly [Chain, ...Chain[]]

  public wagmiConfig?: AdapterOptions<Config>['wagmiConfig']

  public networkControllerClient?: NetworkControllerClient

  public connectionControllerClient?: ConnectionControllerClient

  public defaultCaipNetwork: CaipNetwork | undefined = undefined

  public tokens = HelpersUtil.getCaipTokens(this.options?.tokens)

  public getCaipDefaultNetwork = this.options?.defaultCaipNetwork

  public siweControllerClient = this.options?.siweConfig

  public adapterType: AdapterType = 'wagmi'

  public constructor(configParams?: Partial<CreateConfigParameters>) {
    this.createConfigParams = configParams
  }

  private createWagmiConfig(options: AppKitOptions, appKit: AppKit) {
    this.wagmiChains = convertToAppKitChains(
      options.caipNetworks.filter(
        caipNetwork => caipNetwork.chainNamespace === CommonConstantsUtil.CHAIN.EVM
      )
    )

    const transportsArr = this.wagmiChains.map(chain => [
      chain.id,
      getTransport({ chain, projectId: options.projectId })
    ])

    const transports = Object.fromEntries(transportsArr)
    const connectors: CreateConnectorFn[] = []

    connectors.push(walletConnect(options, appKit))

    if (options.enableInjected !== false) {
      connectors.push(injected({ shimDisconnect: true }))
    }

    if (options.enableCoinbase !== false) {
      connectors.push(
        coinbaseWallet({
          version: '4',
          appName: options.metadata?.name ?? 'Unknown',
          appLogoUrl: options.metadata?.icons[0] ?? 'Unknown',
          preference: options.coinbasePreference ?? 'all'
        })
      )
    }

    const emailEnabled =
      options.features?.email === undefined
        ? CoreConstantsUtil.DEFAULT_FEATURES.email
        : options.features?.email
    const socialsEnabled =
      options.features?.socials === undefined
        ? CoreConstantsUtil.DEFAULT_FEATURES.socials
        : options.features?.socials?.length > 0

    if (emailEnabled || socialsEnabled) {
      connectors.push(
        authConnector({
          chains: this.wagmiChains,
          options: { projectId: options.projectId }
        })
      )
    }

    return createConfig({
      ...this.createConfigParams,
      chains: this.wagmiChains,
      transports,
      connectors: [...connectors, ...(this.createConfigParams?.connectors ?? [])]
    })
  }

  public construct(appKit: AppKit, options: AppKitOptions) {
    if (!options.projectId) {
      throw new Error('web3modal:initialize - projectId is undefined')
    }

    this.appKit = appKit
    this.options = options
    this.caipNetworks = options.caipNetworks
    this.tokens = HelpersUtil.getCaipTokens(options.tokens)
    this.wagmiConfig = this.createWagmiConfig(options, appKit)

    if (!this.wagmiConfig) {
      throw new Error('web3modal:wagmiConfig - is undefined')
    }

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        SafeLocalStorage.setItem(
          SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK,
          JSON.stringify(caipNetwork)
        )
        const chainId = Number(NetworkUtil.caipNetworkIdToNumber(caipNetwork?.id))

        if (chainId && this.wagmiConfig) {
          await switchChain(this.wagmiConfig, { chainId })
        }
      },
      getApprovedCaipNetworksData: async () => {
        if (!this.wagmiConfig) {
          throw new Error(
            'networkControllerClient:getApprovedCaipNetworksData - wagmiConfig is undefined'
          )
        }

        return new Promise(resolve => {
          const connections = new Map(this.wagmiConfig!.state.connections)
          const connection = connections.get(this.wagmiConfig!.state.current || '')
          if (connection?.connector?.id === ConstantsUtil.AUTH_CONNECTOR_ID) {
            resolve(getEmailCaipNetworks())
          } else if (connection?.connector?.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
            const connector = this.wagmiConfig!.connectors.find(
              c => c.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
            )
            resolve(getWalletConnectCaipNetworks(connector))
          }
          resolve({ approvedCaipNetworkIds: undefined, supportsAllNetworks: true })
        })
      }
    }

    this.connectionControllerClient = {
      connectWalletConnect: async () => {
        if (!this.wagmiConfig) {
          throw new Error(
            'connectionControllerClient:getWalletConnectUri - wagmiConfig is undefined'
          )
        }
        const connector = this.wagmiConfig.connectors.find(
          c => c.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
        )

        if (!connector) {
          throw new Error('connectionControllerClient:getWalletConnectUri - connector is undefined')
        }

        const provider = (await connector.getProvider()) as Awaited<
          ReturnType<(typeof UniversalProvider)['init']>
        >

        const siweParams = await this.options?.siweConfig?.getMessageParams?.()
        const isSiweEnabled = this.options?.siweConfig?.options?.enabled
        const isProviderSupported = typeof provider?.authenticate === 'function'
        const isSiweParamsValid = siweParams && Object.keys(siweParams || {}).length > 0

        if (isSiweEnabled && isProviderSupported && isSiweParamsValid) {
          // @ts-expect-error - setting requested chains beforehand avoids wagmi auto disconnecting the session when `connect` is called because it things chains are stale
          await connector.setRequestedChainsIds(siweParams.chains)

          const siweConfig = this.options?.siweConfig

          const params = await siweConfig?.getMessageParams?.()

          if (siweConfig?.options?.enabled && params && Object.keys(params || {}).length > 0) {
            const { SIWEController, getDidChainId, getDidAddress } = await import('@web3modal/siwe')

            const chains = this.options?.caipNetworks.map(network => network.id) as string[]

            const result = await provider.authenticate({
              nonce: await siweConfig.getNonce(),
              methods: [...OPTIONAL_METHODS],
              ...params,
              chains
            })
            // Auths is an array of signed CACAO objects https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-74.md
            const signedCacao = result?.auths?.[0]

            if (signedCacao) {
              const { p, s } = signedCacao
              const cacaoChainId = getDidChainId(p.iss)
              const address = getDidAddress(p.iss)
              if (address && cacaoChainId) {
                SIWEController.setSession({
                  address,
                  chainId: parseInt(cacaoChainId, 10)
                })
              }

              try {
                // Kicks off verifyMessage and populates external states
                const message = provider.client.formatAuthMessage({
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
                await provider.disconnect().catch(console.error)
                // eslint-disable-next-line no-console
                await SIWEController.signOut().catch(console.error)
                throw error
              }
            }
            /*
             * Unassign the connector from the wagmiConfig and allow connect() to reassign it in the next step
             * this avoids case where wagmi throws because the connector is already connected
             * what we need connect() to do is to only setup internal event listeners
             */
            this.wagmiConfig.state.current = ''
          }
        }

        await connect(this.wagmiConfig, { connector })
      },
      connectExternal: async ({ id, provider, info }) => {
        if (!this.wagmiConfig) {
          throw new Error(
            'networkControllerClient:getApprovedCaipNetworksData - wagmiConfig is undefined'
          )
        }
        const connector = this.wagmiConfig.connectors.find(c => c.id === id)
        if (!connector) {
          throw new Error('connectionControllerClient:connectExternal - connector is undefined')
        }
        this.appKit?.setClientId(null)
        if (provider && info && connector.id === ConstantsUtil.EIP6963_CONNECTOR_ID) {
          // @ts-expect-error Exists on EIP6963Connector
          connector.setEip6963Wallet?.({ provider, info })
        }
        const chainId = Number(NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id))
        await connect(this.wagmiConfig, { connector, chainId })
      },
      reconnectExternal: async ({ id }) => {
        if (!this.wagmiConfig) {
          throw new Error(
            'networkControllerClient:getApprovedCaipNetworksData - wagmiConfig is undefined'
          )
        }
        const connector = this.wagmiConfig.connectors.find(c => c.id === id)
        if (!connector) {
          throw new Error('connectionControllerClient:connectExternal - connector is undefined')
        }
        await reconnect(this.wagmiConfig, { connectors: [connector] })
      },
      checkInstalled: ids => {
        const injectedConnector = this.appKit
          ?.getConnectors()
          .find((c: Connector) => c.type === 'INJECTED')
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
        await disconnect(this.wagmiConfig!)
        SafeLocalStorage.removeItem(SafeLocalStorageKeys.WALLET_ID)
        SafeLocalStorage.removeItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK)
        this.appKit?.setClientId(null)
        this.appKit?.resetAccount('eip155')
        this.appKit?.resetAccount('solana')
        if (this.options?.siweConfig?.options?.signOutOnDisconnect) {
          const { SIWEController } = await import('@web3modal/siwe')
          await SIWEController.signOut()
        }
      },
      signMessage: async message => {
        const caipAddress = this.appKit?.getCaipAddress() || ''
        const account = requireCaipAddress(caipAddress)

        return signMessage(this.wagmiConfig!, { message, account })
      },
      estimateGas: async args => {
        try {
          return await wagmiEstimateGas(this.wagmiConfig!, {
            account: args.address,
            to: args.to,
            data: args.data,
            type: 'legacy'
          })
        } catch (error) {
          return BigInt(0)
        }
      },
      sendTransaction: async (data: SendTransactionArgs) => {
        const { chainId } = getAccount(this.wagmiConfig!)
        const txParams = {
          account: data.address,
          to: data.to,
          value: data.value,
          gas: data.gas,
          gasPrice: data.gasPrice,
          data: data.data,
          chainId,
          type: 'legacy' as const
        }
        await prepareTransactionRequest(this.wagmiConfig!, txParams)
        const tx = await wagmiSendTransaction(this.wagmiConfig!, txParams)
        await waitForTransactionReceipt(this.wagmiConfig!, { hash: tx, timeout: 25000 })

        return tx
      },
      writeContract: async (data: WriteContractArgs) => {
        const caipAddress = this.appKit?.getCaipAddress() || ''
        const account = requireCaipAddress(caipAddress)
        const chainId = Number(NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id))
        const tx = await wagmiWriteContract(this.wagmiConfig!, {
          chain: this.wagmiChains?.[chainId],
          chainId,
          address: data.tokenAddress,
          account,
          abi: data.abi,
          functionName: data.method,
          args: [data.receiverAddress, data.tokenAmount]
        })

        return tx
      },
      getEnsAddress: async (value: string) => {
        try {
          if (!this.wagmiConfig) {
            throw new Error(
              'networkControllerClient:getApprovedCaipNetworksData - wagmiConfig is undefined'
            )
          }
          const chainId = Number(
            NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id)
          )
          let ensName: boolean | GetEnsAddressReturnType = false
          let wcName: boolean | string = false
          if (value?.endsWith(CommonConstants.WC_NAME_SUFFIX)) {
            wcName = (await this.appKit?.resolveWalletConnectName(value)) || false
          }
          if (chainId === 1) {
            ensName = await wagmiGetEnsAddress(this.wagmiConfig, {
              name: normalize(value),
              chainId
            })
          }

          return ensName || wcName || false
        } catch {
          return false
        }
      },
      getEnsAvatar: async (value: string) => {
        const chainId = Number(NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id))
        if (chainId !== mainnet.id) {
          return false
        }
        const avatar = await wagmiGetEnsAvatar(this.wagmiConfig!, {
          name: normalize(value),
          chainId
        })

        return avatar || false
      },
      parseUnits,
      formatUnits
    }

    ChainController.state.chains.set(this.chainNamespace, {
      chainNamespace: this.chainNamespace,
      connectionControllerClient: this.connectionControllerClient,
      networkControllerClient: this.networkControllerClient,
      adapterType: this.adapterType
    })

    this.syncConnectors(this.wagmiConfig.connectors)
    this.syncAuthConnector(
      this.wagmiConfig?.connectors.find(c => c.id === ConstantsUtil.AUTH_CONNECTOR_ID)
    )
    this.syncRequestedNetworks(options.caipNetworks)

    watchConnectors(this.wagmiConfig, {
      onChange: _connectors => {
        this.syncConnectors(_connectors)
        this.syncAuthConnector(_connectors.find(c => c.id === ConstantsUtil.AUTH_CONNECTOR_ID))
      }
    })
    watchAccount(this.wagmiConfig, {
      onChange: accountData => {
        console.log('>>> onChange', accountData)
        this.syncAccount(accountData)
      }
    })

    this.appKit?.setEIP6963Enabled(options.enableEIP6963 !== false)
    this.appKit?.subscribeShouldUpdateToAddress((newAddress?: string) => {
      if (newAddress) {
        const connections = getConnections(this.wagmiConfig!)
        const connector = connections[0]?.connector
        if (connector) {
          switchAccount(this.wagmiConfig!, {
            connector
          }).then(response =>
            this.syncAccount({
              address: newAddress as Hex,
              isConnected: true,
              addresses: response.accounts,
              connector,
              chainId: response.chainId,
              status: 'connected'
            })
          )
        }
      }
    })
  }

  // @ts-expect-error: Overriden state type is correct
  public override subscribeState(callback: (state: Web3ModalState) => void) {
    return this.appKit?.subscribeState((state: PublicStateControllerState) =>
      callback({
        ...state,
        selectedNetworkId: Number(NetworkUtil.caipNetworkIdToNumber(state.selectedNetworkId))
      })
    )
  }

  // -- Private -----------------------------------------------------------------
  private syncRequestedNetworks(caipNetworks: CaipNetwork[]) {
    const uniqueChainNamespaces = Array.from(
      new Set(caipNetworks.map(caipNetwork => caipNetwork.chainNamespace))
    )
    uniqueChainNamespaces
      .filter(c => Boolean(c))
      .forEach(chainNamespace => {
        this.appKit?.setRequestedCaipNetworks(
          caipNetworks.filter(caipNetwork => caipNetwork.chainNamespace === chainNamespace),
          chainNamespace
        )
      })
  }

  private async syncAccount({
    address,
    chainId,
    connector,
    addresses,
    status
  }: Partial<
    Pick<
      GetAccountReturnType,
      | 'address'
      | 'isConnected'
      | 'isDisconnected'
      | 'chainId'
      | 'connector'
      | 'addresses'
      | 'status'
    >
  >) {
    if (this.wagmiConfig) {
      if (connector) {
        if (connector && connector.name === 'WalletConnect' && connector.getProvider && address) {
          const currentChainId =
            chainId || Number(NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id))
          const provider = (await connector.getProvider()) as UniversalProvider

          const namespaces = provider?.session?.namespaces || {}
          const namespaceKeys = namespaces ? Object.keys(namespaces) : []

          const preferredAccountType = this.appKit?.getPreferredAccountType()

          namespaceKeys.forEach(key => {
            const chainNamespace = key as ChainNamespace
            const caipAddress = namespaces?.[key]?.accounts[0] as CaipAddress

            ProviderUtil.setProvider(chainNamespace, provider)
            ProviderUtil.setProviderId(chainNamespace, 'walletConnect')

            this.appKit?.setIsConnected(true, chainNamespace)
            this.appKit?.setPreferredAccountType(preferredAccountType, chainNamespace)
            this.appKit?.setCaipAddress(caipAddress, chainNamespace)
          })
          if (this.appKit?.getCaipNetwork()?.chainNamespace !== 'solana') {
            this.syncNetwork(address, currentChainId, true)
            await Promise.all([
              this.syncProfile(address, currentChainId),
              this.syncBalance(address, currentChainId),
              this.syncConnectedWalletInfo(connector),
              this.appKit?.setApprovedCaipNetworksData(this.chainNamespace)
            ])
          }
        } else if (status === 'connected' && address && chainId) {
          const caipAddress = `eip155:${chainId}:${address}` as CaipAddress
          this.appKit?.resetAccount(this.chainNamespace)
          this.syncNetwork(address, chainId, true)
          this.appKit?.setIsConnected(true, this.chainNamespace)
          this.appKit?.setCaipAddress(caipAddress, this.chainNamespace)
          await Promise.all([
            this.syncProfile(address, chainId),
            this.syncBalance(address, chainId),
            this.syncConnectedWalletInfo(connector),
            this.appKit?.setApprovedCaipNetworksData(this.chainNamespace)
          ])
          if (connector) {
            this.syncConnectedWalletInfo(connector)
          }

          // Set by authConnector.onIsConnectedHandler as we need the account type
          const isAuthConnector = connector?.id === ConstantsUtil.AUTH_CONNECTOR_ID
          if (!isAuthConnector && addresses?.length) {
            this.appKit?.setAllAccounts(
              addresses.map(addr => ({ address: addr, type: 'eoa' })),
              this.chainNamespace
            )
          }
        } else if (status === 'disconnected') {
          this.appKit?.resetAccount(this.chainNamespace)
          this.appKit?.resetWcConnection()
          this.appKit?.resetNetwork()
          this.appKit?.setAllAccounts([], this.chainNamespace)
          SafeLocalStorage.removeItem(SafeLocalStorageKeys.WALLET_ID)
          SafeLocalStorage.removeItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK)
        } else if (status === 'reconnecting') {
          this.appKit?.setLoading(true)
          const connectors = getConnectors(this.wagmiConfig)
          const currentConnector = connectors.find(c => c.id === connector.id)

          if (currentConnector) {
            console.log('>>> reconnecting duuude')
            await reconnect(this.wagmiConfig, {
              connectors: [currentConnector]
            })
            this.appKit?.setLoading(false)
          }
        }
      }
    }
  }

  private async syncNetwork(address?: Hex, chainId?: number, isConnected?: boolean) {
    console.log('>>> syncNetwork', address, chainId, isConnected)
    const chain = this.options?.caipNetworks.find((c: CaipNetwork) => c.chainId === chainId)

    if (chain && chainId) {
      this.appKit?.setCaipNetwork({
        chainId: chain.chainId,
        id: chain.id,
        name: chain.name || '',
        imageId: PresetsUtil.NetworkImageIds[chain.chainId],
        imageUrl: this.options?.chainImages?.[chain.chainId],
        chainNamespace: this.chainNamespace,
        currency: chain?.currency || '',
        explorerUrl: chain?.explorerUrl || '',
        rpcUrl: chain?.rpcUrl || ''
      })

      if (isConnected && address && chainId) {
        const caipAddress: CaipAddress = `eip155:${chainId}:${address}`
        this.appKit?.setCaipAddress(caipAddress, this.chainNamespace)
        if (chain?.explorerUrl) {
          const url = `${chain.explorerUrl}/address/${address}`
          this.appKit?.setAddressExplorerUrl(url, this.chainNamespace)
        } else {
          this.appKit?.setAddressExplorerUrl(undefined, this.chainNamespace)
        }

        await this.syncBalance(address, chainId)
      }
    }
  }

  private async syncWalletConnectName(address: Hex) {
    if (!this.appKit) {
      throw new Error('syncWalletConnectName - appKit is undefined')
    }

    try {
      const registeredWcNames = await this.appKit.getWalletConnectName(address)
      if (registeredWcNames[0]) {
        const wcName = registeredWcNames[0]
        this.appKit?.setProfileName(wcName.name, this.chainNamespace)
      } else {
        this.appKit?.setProfileName(null, this.chainNamespace)
      }
    } catch {
      this.appKit?.setProfileName(null, this.chainNamespace)
    }
  }

  private async syncProfile(address: Hex, chainId: Chain['id']) {
    if (!this.appKit) {
      throw new Error('syncProfile - appKit is undefined')
    }

    try {
      const { name, avatar } = await this.appKit.fetchIdentity({
        address
      })
      this.appKit?.setProfileName(name, this.chainNamespace)
      this.appKit?.setProfileImage(avatar, this.chainNamespace)

      if (!name) {
        await this.syncWalletConnectName(address)
      }
    } catch {
      if (chainId === mainnet.id) {
        const profileName = await getEnsName(this.wagmiConfig!, { address, chainId })
        if (profileName) {
          this.appKit?.setProfileName(profileName, this.chainNamespace)
          const profileImage = await wagmiGetEnsAvatar(this.wagmiConfig!, {
            name: profileName,
            chainId
          })
          if (profileImage) {
            this.appKit?.setProfileImage(profileImage, this.chainNamespace)
          }
        } else {
          await this.syncWalletConnectName(address)
          this.appKit?.setProfileImage(null, this.chainNamespace)
        }
      } else {
        await this.syncWalletConnectName(address)
        this.appKit?.setProfileImage(null, this.chainNamespace)
      }
    }
  }

  private async syncBalance(address: Hex, chainId: number) {
    const chain = this.options?.caipNetworks.find((c: CaipNetwork) => c.chainId === chainId)

    console.log('>>> syncBalance', address, chain)
    if (chain && this.wagmiConfig) {
      const balance = await getBalance(this.wagmiConfig, {
        address,
        chainId,
        token: this.options?.tokens?.[chain.id]?.address as Hex
      })
      console.log('>>> syncBalance', balance)
      this.appKit?.setBalance(balance.formatted, balance.symbol, this.chainNamespace)

      return
    }
    this.appKit?.setBalance(undefined, undefined, this.chainNamespace)
  }

  private async syncConnectedWalletInfo(connector: GetAccountReturnType['connector']) {
    if (!connector) {
      throw Error('syncConnectedWalletInfo - connector is undefined')
    }

    if (connector.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID && connector.getProvider) {
      const walletConnectProvider = (await connector.getProvider()) as Awaited<
        ReturnType<(typeof UniversalProvider)['init']>
      >
      if (walletConnectProvider.session) {
        this.appKit?.setConnectedWalletInfo(
          {
            ...walletConnectProvider.session.peer.metadata,
            name: walletConnectProvider.session.peer.metadata.name,
            icon: walletConnectProvider.session.peer.metadata.icons?.[0]
          },
          this.chainNamespace
        )
      }
    } else {
      const wagmiConnector = this.appKit?.getConnectors().find(c => c.id === connector.id)
      this.appKit?.setConnectedWalletInfo(
        {
          name: connector.name,
          icon: connector.icon || this.appKit.getConnectorImage(wagmiConnector)
        },
        this.chainNamespace
      )
    }
  }

  private syncConnectors(_connectors: AdapterOptions<Config>['wagmiConfig']['connectors']) {
    const connectors = _connectors.map(connector => ({ ...connector, chain: this.chainNamespace }))
    const uniqueIds = new Set()
    const filteredConnectors = connectors.filter(item => {
      const isDuplicate = uniqueIds.has(item.id)
      uniqueIds.add(item.id)

      return !isDuplicate
    })

    const w3mConnectors: Connector[] = []

    filteredConnectors.forEach(({ id, name, type, icon }) => {
      // Auth connector is initialized separately
      const shouldSkip = ConstantsUtil.AUTH_CONNECTOR_ID === id
      if (!shouldSkip) {
        w3mConnectors.push({
          id,
          explorerId: PresetsUtil.ConnectorExplorerIds[id],
          imageUrl: this.options?.connectorImages?.[id] ?? icon,
          name: PresetsUtil.ConnectorNamesMap[id] ?? name,
          imageId: PresetsUtil.ConnectorImageIds[id],
          type: PresetsUtil.ConnectorTypesMap[type] ?? 'EXTERNAL',
          info: {
            rdns: id
          },
          chain: this.chainNamespace
        })
      }
    })

    this.appKit?.setConnectors(w3mConnectors)
  }

  private async syncAuthConnector(
    _authConnector: AdapterOptions<Config>['wagmiConfig']['connectors'][number] | undefined
  ) {
    const connector =
      _authConnector as unknown as AdapterOptions<Config>['wagmiConfig']['connectors'][0]

    if (connector) {
      const provider = await connector.getProvider()
      this.appKit?.addConnector({
        id: ConstantsUtil.AUTH_CONNECTOR_ID,
        type: 'AUTH',
        name: 'Auth',
        provider,
        chain: this.chainNamespace
      })
      this.initAuthConnectorListeners(_authConnector)
    }
  }

  private async initAuthConnectorListeners(
    _authConnector: AdapterOptions<Config>['wagmiConfig']['connectors'][number] | undefined
  ) {
    if (_authConnector) {
      await this.listenAuthConnector(_authConnector)
      await this.listenModal(_authConnector)
    }
  }

  private async listenAuthConnector(
    connector: AdapterOptions<Config>['wagmiConfig']['connectors'][number]
  ) {
    if (typeof window !== 'undefined' && connector) {
      this.appKit?.setLoading(true)
      const provider = (await connector.getProvider()) as W3mFrameProvider
      const isLoginEmailUsed = provider.getLoginEmailUsed()

      this.appKit?.setLoading(isLoginEmailUsed)

      if (isLoginEmailUsed) {
        this.appKit?.setIsConnected(false, this.chainNamespace)
      }

      provider.onRpcRequest((request: W3mFrameTypes.RPCRequest) => {
        if (W3mFrameHelpers.checkIfRequestExists(request)) {
          if (!W3mFrameHelpers.checkIfRequestIsAllowed(request)) {
            if (this.appKit?.isOpen()) {
              if (this.appKit?.isTransactionStackEmpty()) {
                return
              }
              if (this.appKit?.isTransactionShouldReplaceView()) {
                this.appKit?.replace('ApproveTransaction')
              } else {
                this.appKit?.redirect('ApproveTransaction')
              }
            } else {
              this.appKit?.open({ view: 'ApproveTransaction' })
            }
          }
        } else {
          this.appKit?.open()
          // eslint-disable-next-line no-console
          console.error(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_MESSAGE, {
            method: request.method
          })
          setTimeout(() => {
            this.appKit?.showErrorMessage(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_UI_MESSAGE)
          }, 300)
          provider.rejectRpcRequests()
        }
      })

      provider.onRpcError(() => {
        const isModalOpen = this.appKit?.isOpen()

        if (isModalOpen) {
          if (this.appKit?.isTransactionStackEmpty()) {
            this.appKit?.close()
          } else {
            this.appKit?.popTransactionStack(true)
          }
        }
      })

      provider.onRpcSuccess(() => {
        if (this.appKit?.isTransactionStackEmpty()) {
          this.appKit?.close()
        } else {
          this.appKit?.popTransactionStack()
        }
      })

      provider.onNotConnected(() => {
        const isConnected = this.appKit?.getIsConnectedState()
        if (!isConnected) {
          this.appKit?.setIsConnected(false, this.chainNamespace)
          this.appKit?.setLoading(false)
        }
      })

      provider.onIsConnected(req => {
        this.appKit?.setIsConnected(true, this.chainNamespace)
        this.appKit?.setSmartAccountDeployed(Boolean(req.smartAccountDeployed), this.chainNamespace)
        this.appKit?.setPreferredAccountType(
          req.preferredAccountType as W3mFrameTypes.AccountType,
          this.chainNamespace
        )
        this.appKit?.setLoading(false)
        this.appKit?.setAllAccounts(
          req.accounts || [
            {
              address: req.address,
              type: (req.preferredAccountType || 'eoa') as W3mFrameTypes.AccountType
            }
          ],
          this.chainNamespace
        )
      })

      provider.onGetSmartAccountEnabledNetworks(networks => {
        this.appKit?.setSmartAccountEnabledNetworks(networks, this.chainNamespace)
      })

      provider.onSetPreferredAccount(({ address, type }) => {
        if (!address) {
          return
        }
        this.appKit?.setPreferredAccountType(type as W3mFrameTypes.AccountType, this.chainNamespace)
        this.syncAccount({
          address: address as `0x${string}`,
          isConnected: true,
          chainId: Number(NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id)),
          connector
        })
      })
    }
  }

  private async listenModal(
    connector: AdapterOptions<Config>['wagmiConfig']['connectors'][number]
  ) {
    const provider = (await connector.getProvider()) as W3mFrameProvider
    this.subscribeState(val => {
      if (!val.open) {
        provider.rejectRpcRequests()
      }
    })
  }
}
