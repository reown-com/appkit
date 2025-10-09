import { type CreateConfigParameters, createConnector } from '@wagmi/core'
import { SwitchChainError, getAddress } from 'viem'
import type { Address } from 'viem'

import {
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  ConstantsUtil,
  type EmbeddedWalletTimeoutReason
} from '@reown/appkit-common'
import { NetworkUtil } from '@reown/appkit-common'
import {
  AlertController,
  ChainController,
  ConnectorController,
  SIWXUtil,
  getActiveCaipNetwork,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { ErrorUtil } from '@reown/appkit-utils'
import { W3mFrameProvider } from '@reown/appkit-wallet'
import { W3mFrameProviderSingleton } from '@reown/appkit/auth-provider'

// -- Types ----------------------------------------------------------------------------------------
interface W3mFrameProviderOptions {
  projectId: string
  enableAuthLogger?: boolean
}

export type AuthParameters = {
  chains?: CreateConfigParameters['chains']
  options: W3mFrameProviderOptions
}

// -- Connector ------------------------------------------------------------------------------------
export function authConnector(parameters: AuthParameters) {
  let currentAccounts: Address[] = []
  let socialProvider: W3mFrameProvider | undefined = undefined
  let connectSocialPromise: Promise<Awaited<ReturnType<typeof connectSocial>>> | undefined =
    undefined
  type Properties = {
    provider?: W3mFrameProvider
    getProvider(): Promise<W3mFrameProvider>
    getChainId(): Promise<number>
    getAccounts(): Promise<readonly Address[]>
    isAuthorized(): Promise<boolean>
    disconnect(): Promise<void>
    onAccountsChanged(accounts: string[]): void
    onChainChanged(chain: string | number): void
    onDisconnect(error?: unknown): Promise<void>
  }

  function parseChainId(chainId: string | number) {
    const networks = ChainController.getCaipNetworks(ConstantsUtil.CHAIN.EVM)
    let network = Number(NetworkUtil.parseEvmChainId(chainId))
    if (!networks.some(n => String(n.id) === String(chainId))) {
      const currentChainId =
        ChainController.getActiveCaipNetwork(ConstantsUtil.CHAIN.EVM)?.id || networks[0]?.id
      if (currentChainId && Number.isInteger(Number(currentChainId))) {
        network = Number(currentChainId)
      }
    }
    if (!network) {
      throw new Error('ChainId not found in networks')
    }

    return network
  }

  function getProviderInstance() {
    if (!socialProvider) {
      socialProvider = W3mFrameProviderSingleton.getInstance({
        projectId: parameters.options.projectId,
        chainId: getActiveCaipNetwork()?.caipNetworkId,
        enableLogger: parameters.options.enableAuthLogger,
        onTimeout: (reason: EmbeddedWalletTimeoutReason) => {
          if (reason === 'iframe_load_failed') {
            AlertController.open(ErrorUtil.ALERT_ERRORS.IFRAME_LOAD_FAILED, 'error')
          } else if (reason === 'iframe_request_timeout') {
            AlertController.open(ErrorUtil.ALERT_ERRORS.IFRAME_REQUEST_TIMEOUT, 'error')
          } else if (reason === 'unverified_domain') {
            AlertController.open(ErrorUtil.ALERT_ERRORS.UNVERIFIED_DOMAIN, 'error')
          }
        },
        abortController: ErrorUtil.EmbeddedWalletAbortController,
        getActiveCaipNetwork: (namespace?: ChainNamespace) => getActiveCaipNetwork(namespace),
        getCaipNetworks: (namespace?: ChainNamespace) => ChainController.getCaipNetworks(namespace)
      })
    }

    return socialProvider
  }

  async function connectSocial(
    options: {
      chainId?: number
      isReconnecting?: boolean
      socialUri?: string
    } = {}
  ) {
    const provider = getProviderInstance()

    let chainId = options.chainId

    if (options.isReconnecting) {
      const lastUsedChainId = NetworkUtil.parseEvmChainId(provider.getLastUsedChainId() || '')
      const defaultChainId = parameters.chains?.[0].id

      chainId = lastUsedChainId || defaultChainId

      if (!chainId) {
        throw new Error('ChainId not found in provider')
      }
    }

    const preferredAccountType = getPreferredAccountType('eip155')
    const {
      address,
      chainId: frameChainId,
      accounts
    } = await SIWXUtil.authConnectorAuthenticate({
      authConnector: provider,
      chainId,
      preferredAccountType,
      socialUri: options.socialUri,
      chainNamespace: CommonConstantsUtil.CHAIN.EVM
    })

    currentAccounts = accounts?.map(a => a.address as Address) || [address as Address]

    const parsedChainId = parseChainId(frameChainId)

    return {
      accounts: currentAccounts,
      account: address as Address,
      chainId: parsedChainId,
      chain: {
        id: parsedChainId,
        unsupported: false
      }
    }
  }

  return createConnector<W3mFrameProvider, Properties>(config => ({
    id: CommonConstantsUtil.CONNECTOR_ID.AUTH,
    name: CommonConstantsUtil.CONNECTOR_NAMES.AUTH,
    type: 'AUTH',
    chain: CommonConstantsUtil.CHAIN.EVM,
    async connect<withCapabilities extends boolean = false>(
      this: Properties,
      options: {
        chainId?: number
        isReconnecting?: boolean
        withCapabilities?: withCapabilities | boolean
        socialUri?: string
        rpcUrl?: string
      } = {}
    ) {
      if (connectSocialPromise) {
        const result = await connectSocialPromise

        return {
          accounts: (options.withCapabilities
            ? (result.accounts.map(address => ({ address, capabilities: {} })) as unknown)
            : result.accounts) as withCapabilities extends true
            ? readonly { address: Address; capabilities: Record<string, unknown> }[]
            : readonly Address[],
          chainId: result.chainId
        }
      }

      if (!connectSocialPromise) {
        connectSocialPromise = new Promise(resolve => {
          resolve(connectSocial(options))
        })
      }
      const result = await connectSocialPromise
      connectSocialPromise = undefined

      return {
        accounts: (options.withCapabilities
          ? (result.accounts.map(address => ({ address, capabilities: {} })) as unknown)
          : result.accounts) as withCapabilities extends true
          ? readonly { address: Address; capabilities: Record<string, unknown> }[]
          : readonly Address[],
        chainId: result.chainId
      }
    },

    async disconnect() {
      const provider = await this.getProvider()
      await provider.disconnect()
    },

    getAccounts() {
      if (!currentAccounts?.length) {
        return Promise.resolve([])
      }

      config.emitter.emit('change', { accounts: currentAccounts })

      return Promise.resolve(currentAccounts)
    },

    async getProvider(this: Properties) {
      if (!this.provider) {
        this.provider = W3mFrameProviderSingleton.getInstance({
          projectId: parameters.options.projectId,
          chainId: getActiveCaipNetwork()?.caipNetworkId,
          enableLogger: parameters.options.enableAuthLogger,
          abortController: ErrorUtil.EmbeddedWalletAbortController,
          onTimeout: (reason: EmbeddedWalletTimeoutReason) => {
            if (reason === 'iframe_load_failed') {
              AlertController.open(ErrorUtil.ALERT_ERRORS.IFRAME_LOAD_FAILED, 'error')
            } else if (reason === 'iframe_request_timeout') {
              AlertController.open(ErrorUtil.ALERT_ERRORS.IFRAME_REQUEST_TIMEOUT, 'error')
            } else if (reason === 'unverified_domain') {
              AlertController.open(ErrorUtil.ALERT_ERRORS.UNVERIFIED_DOMAIN, 'error')
            }
          },
          getActiveCaipNetwork: (namespace?: ChainNamespace) => getActiveCaipNetwork(namespace),
          getCaipNetworks: (namespace?: ChainNamespace) =>
            ChainController.getCaipNetworks(namespace)
        })
      }

      return Promise.resolve(this.provider)
    },

    async getChainId() {
      const provider = await this.getProvider()
      const { chainId } = await provider.getChainId()

      return parseChainId(chainId)
    },

    async isAuthorized() {
      const activeChain = ChainController.state.activeChain
      const isActiveChainEvm = activeChain === CommonConstantsUtil.CHAIN.EVM
      const isAnyAuthConnected = ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.some(
        chain => ConnectorController.getConnectorId(chain) === CommonConstantsUtil.CONNECTOR_ID.AUTH
      )

      if (isAnyAuthConnected && !isActiveChainEvm) {
        return false
      }

      const provider = await this.getProvider()

      return Promise.resolve(provider.getLoginEmailUsed())
    },

    async switchChain({ chainId }) {
      try {
        const chain = config.chains.find(c => c.id === chainId)
        if (!chain) {
          throw new SwitchChainError(new Error('chain not found on connector.'))
        }
        const provider = await this.getProvider()

        const preferredAccountType = getPreferredAccountType('eip155')

        // We connect instead, since changing the chain may cause the address to change as well
        const response = await provider.connect({
          chainId,
          preferredAccountType
        })

        currentAccounts = response?.accounts?.map(
          (a: { type: 'eoa' | 'smartAccount'; address: string }) => a.address as Address
        ) || [response.address as Address]

        config.emitter.emit('change', {
          chainId: Number(chainId),
          accounts: currentAccounts
        })

        return chain
      } catch (error) {
        if (error instanceof Error) {
          throw new SwitchChainError(error)
        }
        throw error
      }
    },

    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.onDisconnect()
      } else {
        config.emitter.emit('change', { accounts: accounts.map(getAddress) })
      }
    },

    onChainChanged(chain) {
      const chainId = Number(chain)
      config.emitter.emit('change', { chainId })
    },

    async onDisconnect(_error) {
      const provider = await this.getProvider()
      await provider.disconnect()
    }
  }))
}
