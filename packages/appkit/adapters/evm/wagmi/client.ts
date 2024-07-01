/* eslint-disable no-console */
import { EthereumProvider, OPTIONAL_METHODS } from '@walletconnect/ethereum-provider'
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
  waitForTransactionReceipt
} from '@wagmi/core'
import type { OptionsControllerState } from '@web3modal/core'
import { mainnet } from 'viem/chains'
import { prepareTransactionRequest, sendTransaction as wagmiSendTransaction } from '@wagmi/core'
import type { Chain } from '@wagmi/core/chains'
import type { GetAccountReturnType, GetEnsAddressReturnType } from '@wagmi/core'
import type {
  CaipAddress,
  CaipNetwork,
  ConnectionControllerClient,
  Connector,
  NetworkControllerClient,
  PublicStateControllerState,
  SendTransactionArgs,
  SocialProvider,
  WriteContractArgs
} from '@web3modal/scaffold'
import { formatUnits, parseUnits } from 'viem'
import type { Hex } from 'viem'
import { ConstantsUtil, PresetsUtil, HelpersUtil } from '@web3modal/scaffold-utils'
import { ConstantsUtil as CommonConstants } from '@web3modal/common'
import {
  getCaipDefaultChain,
  getEmailCaipNetworks,
  getWalletConnectCaipNetworks
} from './utils/helpers.js'
import { W3mFrameConstants, W3mFrameHelpers, W3mFrameRpcConstants } from '@web3modal/wallet'
import type { W3mFrameProvider, W3mFrameTypes } from '@web3modal/wallet'
import { NetworkUtil } from '@web3modal/common'
import type { defaultWagmiConfig as coreConfig } from './utils/defaultWagmiCoreConfig.js'
import type { defaultWagmiConfig as reactConfig } from './utils/defaultWagmiReactConfig.js'
import { normalize } from 'viem/ens'
import type { AppKitOptions } from '../../../utils/TypesUtil.js'
import type { Chain as AvailableChain, CaipNetworkId } from '@web3modal/common'
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common'
import type { AppKit } from '../../../src/client.js'

// -- Types ---------------------------------------------------------------------
export type CoreConfig = ReturnType<typeof coreConfig>
export type ReactConfig = ReturnType<typeof reactConfig>
type Config = CoreConfig | ReactConfig

export interface Web3ModalClientOptions<C extends Config>
  extends Pick<AppKitOptions, 'siweConfig' | 'enableEIP6963'> {
  wagmiConfig: C
  defaultChain?: Chain
}

export type Web3ModalOptions<C extends Config> = Omit<Web3ModalClientOptions<C>, '_sdkVersion'>

// @ts-expect-error: Overridden state type is correct
interface Web3ModalState extends PublicStateControllerState {
  selectedNetworkId: number | undefined
}

// -- Client --------------------------------------------------------------------
export class EVMWagmiClient {
  private appKit: AppKit | undefined = undefined

  public options: AppKitOptions | undefined = undefined

  private hasSyncedConnectedAccount = false

  private wagmiConfig: Web3ModalClientOptions<CoreConfig>['wagmiConfig']

  public chain: AvailableChain = CommonConstantsUtil.CHAIN.EVM

  public networkControllerClient: NetworkControllerClient

  public connectionControllerClient: ConnectionControllerClient

  public defaultChain: CaipNetwork | undefined = undefined

  public constructor(options: Web3ModalClientOptions<CoreConfig>) {
    const { wagmiConfig, defaultChain } = options

    if (!wagmiConfig) {
      throw new Error('web3modal:constructor - wagmiConfig is undefined')
    }

    this.wagmiConfig = wagmiConfig
    this.defaultChain = getCaipDefaultChain(defaultChain)

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = NetworkUtil.caipNetworkIdToNumber(caipNetwork?.id)

        if (chainId) {
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
          const connections = new Map(this.wagmiConfig.state.connections)
          const connection = connections.get(this.wagmiConfig.state.current || '')

          if (connection?.connector?.id === ConstantsUtil.AUTH_CONNECTOR_ID) {
            resolve(getEmailCaipNetworks())
          } else if (connection?.connector?.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
            const connector = this.wagmiConfig.connectors.find(
              c => c.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
            )

            resolve(getWalletConnectCaipNetworks(connector))
          }

          resolve({ approvedCaipNetworkIds: undefined, supportsAllNetworks: true })
        })
      }
    }

    this.connectionControllerClient = {
      connectWalletConnect: async onUri => {
        const siweConfig = this.options?.siweConfig

        if (!this.wagmiConfig) {
          throw new Error(
            'networkControllerClient:getApprovedCaipNetworksData - wagmiConfig is undefined'
          )
        }

        const connector = this.wagmiConfig.connectors.find(
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

        const chainId = NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id)
        // Make sure client uses ethereum provider version that supports `authenticate`
        if (siweConfig?.options?.enabled && typeof provider?.authenticate === 'function') {
          const { SIWEController, getDidChainId, getDidAddress } = await import('@web3modal/siwe')
          const siweParams = await siweConfig.getMessageParams()
          // @ts-expect-error - setting requested chains beforehand avoids wagmi auto disconnecting the session when `connect` is called because it things chains are stale
          await connector.setRequestedChainsIds(siweParams.chains)

          const result = await provider.authenticate({
            nonce: await siweConfig.getNonce(),
            methods: [...OPTIONAL_METHODS],
            ...siweParams
          })

          // Auths is an array of signed CACAO objects https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-74.md
          const signedCacao = result?.auths?.[0]
          if (signedCacao) {
            const { p, s } = signedCacao
            const cacaoChainId = getDidChainId(p.iss) || ''
            const address = getDidAddress(p.iss)
            if (address && cacaoChainId) {
              SIWEController.setSession({
                address,
                chainId: parseInt(cacaoChainId, 10)
              })
            }
            try {
              // Kicks off verifyMessage and populates external states
              const message = provider.signer.client.formatAuthMessage({
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
            /*
             * Unassign the connector from the wagmiConfig and allow connect() to reassign it in the next step
             * this avoids case where wagmi throws because the connector is already connected
             * what we need connect() to do is to only setup internal event listeners
             */
            this.wagmiConfig.state.current = ''
          }
        }
        await connect(this.wagmiConfig, { connector, chainId })
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
        if (provider && info && connector.id === ConstantsUtil.EIP6963_CONNECTOR_ID) {
          // @ts-expect-error Exists on EIP6963Connector
          connector.setEip6963Wallet?.({ provider, info })
        }
        const chainId = NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id)

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
        try {
          await disconnect(this.wagmiConfig)

          const siweConfig = this.options?.siweConfig
          if (siweConfig?.options?.signOutOnDisconnect) {
            const { SIWEController } = await import('@web3modal/siwe')
            await SIWEController.signOut()
          }
        } catch (error) {
          console.error('Failed to disconnect1', error)
          throw new Error('Failed to disconnect1')
        }
      },

      signMessage: async message => signMessage(this.wagmiConfig, { message }),

      estimateGas: async args => {
        try {
          return await wagmiEstimateGas(this.wagmiConfig, {
            account: args.address,
            to: args.to,
            data: args.data,
            type: 'legacy'
          })
        } catch (error) {
          return 0n
        }
      },

      sendTransaction: async (data: SendTransactionArgs) => {
        const { chainId } = getAccount(this.wagmiConfig)

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

        await prepareTransactionRequest(this.wagmiConfig, txParams)
        const tx = await wagmiSendTransaction(this.wagmiConfig, txParams)

        await waitForTransactionReceipt(this.wagmiConfig, { hash: tx, timeout: 25000 })

        return tx
      },

      writeContract: async (data: WriteContractArgs) => {
        if (!this.wagmiConfig) {
          throw new Error(
            'networkControllerClient:getApprovedCaipNetworksData - wagmiConfig is undefined'
          )
        }

        const chainId = NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id)

        const tx = await wagmiWriteContract(this.wagmiConfig, {
          chainId,
          address: data.tokenAddress,
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

          const chainId = NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id)
          let ensName: boolean | GetEnsAddressReturnType = false
          let wcName: boolean | string = false

          if (value?.endsWith(CommonConstants.WC_NAME_SUFFIX)) {
            wcName = (await this.appKit?.resolveWalletConnectName(value)) || false
          }

          if (chainId === mainnet.id) {
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
        const chainId = NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id)

        if (chainId !== mainnet.id) {
          return false
        }

        const avatar = await wagmiGetEnsAvatar(this.wagmiConfig, {
          name: normalize(value),
          chainId
        })

        return avatar || false
      },

      parseUnits,

      formatUnits
    }
  }

  public construct(appKit: AppKit, options: OptionsControllerState) {
    if (!options.projectId) {
      throw new Error('web3modal:initialize - projectId is undefined')
    }
    this.appKit = appKit
    this.options = options

    this.syncRequestedNetworks([...this.wagmiConfig.chains])
    this.syncConnectors([...this.wagmiConfig.connectors.map(c => ({ ...c, chain: this.chain }))])
    this.initAuthConnectorListeners([...this.wagmiConfig.connectors])

    // Wagmi listeners
    watchConnectors(this.wagmiConfig, {
      onChange: connectors => {
        this.syncConnectors([
          ...connectors.map(c => ({
            ...c,
            chain: this.chain
          }))
        ])
      }
    })
    watchAccount(this.wagmiConfig, {
      onChange: accountData => {
        this.syncAccount(accountData)
      }
    })

    this.appKit?.setEIP6963Enabled(options.enableEIP6963 !== false)
  }

  public tokens = HelpersUtil.getCaipTokens(this.options?.tokens)

  public getCaipDefaultChain = this.options?.defaultChain

  public siweControllerClient = this.options?.siweConfig

  // @ts-expect-error: Overriden state type is correct
  public override subscribeState(callback: (state: Web3ModalState) => void) {
    return this.appKit?.subscribeState((state: PublicStateControllerState) =>
      callback({
        ...state,
        selectedNetworkId: NetworkUtil.caipNetworkIdToNumber(state.selectedNetworkId)
      })
    )
  }

  // -- Private -----------------------------------------------------------------
  private syncRequestedNetworks(chains: Chain[]) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `${ConstantsUtil.EIP155}:${chain.id}`,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.id],
          imageUrl: this.options?.chainImages?.[chain.id],
          chain: this.chain
        }) as CaipNetwork
    )
    this.appKit?.setRequestedCaipNetworks(requestedCaipNetworks ?? [], this.chain)
  }

  private async syncAccount({
    address,
    isConnected,
    chainId,
    connector
  }: Pick<GetAccountReturnType, 'address' | 'isConnected' | 'chainId' | 'connector'>) {
    this.appKit?.resetAccount(this.chain)
    this.syncNetwork(address, chainId, isConnected)
    if (isConnected && address && chainId) {
      const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`
      this.appKit?.setIsConnected(isConnected, this.chain)
      this.appKit?.setCaipAddress(caipAddress, this.chain)
      await Promise.all([
        this.syncProfile(address, chainId),
        this.syncBalance(address, chainId),
        this.syncConnectedWalletInfo(connector),
        this.appKit?.setApprovedCaipNetworksData(this.chain)
      ])
      this.hasSyncedConnectedAccount = true
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.appKit?.resetWcConnection()
      this.appKit?.resetNetwork()
    }
  }

  private async syncNetwork(address?: Hex, chainId?: number, isConnected?: boolean) {
    const chain = this.wagmiConfig.chains.find((c: Chain) => c.id === chainId)

    if (chain || chainId) {
      const name = chain?.name ?? chainId?.toString()
      const id = Number(chain?.id ?? chainId)
      const caipChainId: CaipNetworkId = `${ConstantsUtil.EIP155}:${id}`
      this.appKit?.setCaipNetwork({
        id: caipChainId,
        name,
        imageId: PresetsUtil.EIP155NetworkImageIds[id],
        imageUrl: this.options?.chainImages?.[id],
        chain: this.chain
      })
      if (isConnected && address && chainId) {
        const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${id}:${address}`
        this.appKit?.setCaipAddress(caipAddress, this.chain)
        if (chain?.blockExplorers?.default?.url) {
          const url = `${chain.blockExplorers.default.url}/address/${address}`
          this.appKit?.setAddressExplorerUrl(url, this.chain)
        } else {
          this.appKit?.setAddressExplorerUrl(undefined, this.chain)
        }
        if (this.hasSyncedConnectedAccount) {
          await this.syncProfile(address, chainId)
          await this.syncBalance(address, chainId)
        }
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
        this.appKit?.setProfileName(wcName.name, this.chain)
      } else {
        this.appKit?.setProfileName(null, this.chain)
      }
    } catch {
      this.appKit?.setProfileName(null, this.chain)
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
      this.appKit?.setProfileName(name, this.chain)
      this.appKit?.setProfileImage(avatar, this.chain)

      if (!name) {
        await this.syncWalletConnectName(address)
      }
    } catch {
      if (chainId === mainnet.id) {
        const profileName = await getEnsName(this.wagmiConfig, { address, chainId })
        if (profileName) {
          this.appKit?.setProfileName(profileName, this.chain)
          const profileImage = await wagmiGetEnsAvatar(this.wagmiConfig, {
            name: profileName,
            chainId
          })
          if (profileImage) {
            this.appKit?.setProfileImage(profileImage, this.chain)
          }
        } else {
          await this.syncWalletConnectName(address)
          this.appKit?.setProfileImage(null, this.chain)
        }
      } else {
        await this.syncWalletConnectName(address)
        this.appKit?.setProfileImage(null, this.chain)
      }
    }
  }

  private async syncBalance(address: Hex, chainId: number) {
    const chain = this.wagmiConfig.chains.find((c: Chain) => c.id === chainId)
    if (chain) {
      const balance = await getBalance(this.wagmiConfig, {
        address,
        chainId: chain.id,
        token: this.options?.tokens?.[chain.id]?.address as Hex
      })
      this.appKit?.setBalance(balance.formatted, balance.symbol, this.chain)

      return
    }
    this.appKit?.setBalance(undefined, undefined, this.chain)
  }

  private async syncConnectedWalletInfo(connector: GetAccountReturnType['connector']) {
    if (!connector) {
      throw Error('syncConnectedWalletInfo - connector is undefined')
    }

    if (connector.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID && connector.getProvider) {
      const walletConnectProvider = (await connector.getProvider()) as Awaited<
        ReturnType<(typeof EthereumProvider)['init']>
      >
      if (walletConnectProvider.session) {
        this.appKit?.setConnectedWalletInfo(
          {
            ...walletConnectProvider.session.peer.metadata,
            name: walletConnectProvider.session.peer.metadata.name,
            icon: walletConnectProvider.session.peer.metadata.icons?.[0]
          },
          this.chain
        )
      }
    } else {
      this.appKit?.setConnectedWalletInfo(
        { name: connector.name, icon: connector.icon },
        this.chain
      )
    }
  }

  private syncConnectors(
    connectors: Web3ModalClientOptions<CoreConfig>['wagmiConfig']['connectors']
  ) {
    const uniqueIds = new Set()
    const filteredConnectors = connectors.filter(
      item => !uniqueIds.has(item.id) && uniqueIds.add(item.id)
    )

    const w3mConnectors: Connector[] = []

    const coinbaseSDKId = ConstantsUtil.COINBASE_SDK_CONNECTOR_ID

    // Check if coinbase injected connector is present
    const coinbaseConnector = filteredConnectors.find(
      c => c.id === ConstantsUtil.CONNECTOR_RDNS_MAP[ConstantsUtil.COINBASE_CONNECTOR_ID]
    )

    filteredConnectors.forEach(({ id, name, type, icon }) => {
      // If coinbase injected connector is present, skip coinbase sdk connector.
      const isCoinbaseRepeated = coinbaseConnector && id === coinbaseSDKId
      const shouldSkip = isCoinbaseRepeated || ConstantsUtil.AUTH_CONNECTOR_ID === id
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
          chain: this.chain
        })
      }
    })
    this.appKit?.setConnectors(w3mConnectors)
    this.syncAuthConnector(filteredConnectors)
  }

  private async syncAuthConnector(
    connectors: Web3ModalClientOptions<CoreConfig>['wagmiConfig']['connectors']
  ) {
    const authConnector = connectors.find(
      ({ id }) => id === ConstantsUtil.AUTH_CONNECTOR_ID
    ) as unknown as Web3ModalClientOptions<CoreConfig>['wagmiConfig']['connectors'][0] & {
      email: boolean
      socials: SocialProvider[]
      showWallets?: boolean
    }
    if (authConnector) {
      const provider = await authConnector.getProvider()
      this.appKit?.addConnector({
        id: ConstantsUtil.AUTH_CONNECTOR_ID,
        type: 'AUTH',
        name: 'Auth',
        provider,
        email: authConnector.email,
        socials: authConnector.socials,
        showWallets: authConnector?.showWallets === undefined ? true : authConnector.showWallets,
        chain: this.chain
      })
    }
  }

  private async initAuthConnectorListeners(
    connectors: Web3ModalClientOptions<CoreConfig>['wagmiConfig']['connectors']
  ) {
    const authConnector = connectors.find(({ id }) => id === ConstantsUtil.AUTH_CONNECTOR_ID)
    if (authConnector) {
      await this.listenAuthConnector(authConnector)
      await this.listenModal(authConnector)
    }
  }

  private async listenAuthConnector(
    connector: Web3ModalClientOptions<CoreConfig>['wagmiConfig']['connectors'][number]
  ) {
    if (typeof window !== 'undefined' && connector) {
      this.appKit?.setLoading(true)
      const provider = (await connector.getProvider()) as W3mFrameProvider
      const isLoginEmailUsed = provider.getLoginEmailUsed()

      this.appKit?.setLoading(isLoginEmailUsed)

      if (isLoginEmailUsed) {
        this.appKit?.setIsConnected(false, this.chain)
      }

      provider.onRpcRequest(request => {
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
          const method = W3mFrameHelpers.getRequestMethod(request)
          // eslint-disable-next-line no-console
          console.error(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_MESSAGE, { method })
          setTimeout(() => {
            this.appKit?.showErrorMessage(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_UI_MESSAGE)
          }, 300)
          provider.rejectRpcRequest()
        }
      })

      provider.onRpcResponse(response => {
        const responseType = W3mFrameHelpers.getResponseType(response)

        switch (responseType) {
          case W3mFrameConstants.RPC_RESPONSE_TYPE_ERROR: {
            const isModalOpen = this.appKit?.isOpen()

            if (isModalOpen) {
              if (this.appKit?.isTransactionStackEmpty()) {
                this.appKit?.close()
              } else {
                this.appKit?.popTransactionStack(true)
              }
            }
            break
          }
          case W3mFrameConstants.RPC_RESPONSE_TYPE_TX: {
            if (this.appKit?.isTransactionStackEmpty()) {
              this.appKit?.close()
            } else {
              this.appKit?.popTransactionStack()
            }
            break
          }
          default:
            break
        }
      })

      provider.onNotConnected(() => {
        const isConnected = this.appKit?.getIsConnectedState()
        if (!isConnected) {
          this.appKit?.setIsConnected(false, this.chain)
          this.appKit?.setLoading(false)
        }
      })

      provider.onIsConnected(req => {
        this.appKit?.setIsConnected(true, this.chain)
        this.appKit?.setSmartAccountDeployed(Boolean(req.smartAccountDeployed), this.chain)
        this.appKit?.setPreferredAccountType(
          req.preferredAccountType as W3mFrameTypes.AccountType,
          this.chain
        )
        this.appKit?.setLoading(false)
      })

      provider.onGetSmartAccountEnabledNetworks(networks => {
        this.appKit?.setSmartAccountEnabledNetworks(networks, this.chain)
      })

      provider.onSetPreferredAccount(({ address, type }) => {
        if (!address) {
          return
        }
        const chainId = NetworkUtil.caipNetworkIdToNumber(this.appKit?.getCaipNetwork()?.id)
        this.syncAccount({
          address: address as `0x${string}`,
          chainId,
          isConnected: true,
          connector
        }).then(
          () => this.appKit?.setPreferredAccountType(type as W3mFrameTypes.AccountType, this.chain)
        )
      })
    }
  }

  private async listenModal(
    connector: Web3ModalClientOptions<CoreConfig>['wagmiConfig']['connectors'][number]
  ) {
    const provider = (await connector.getProvider()) as W3mFrameProvider
    this.subscribeState(val => {
      if (!val.open) {
        provider.rejectRpcRequest()
      }
    })
  }
}
