/* eslint-disable no-await-in-loop */
import { formatJsonRpcResult } from '@json-rpc-tools/utils'
import { type Page } from '@playwright/test'
import { type BuildApprovedNamespacesParams, getSdkError } from '@walletconnect/utils'
import { fromHex } from 'viem'

import { DEFAULT_METHODS } from '@reown/appkit'
import { type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import type { WalletKitTypes } from '@reown/walletkit'

import { WalletManager } from '../managers/wallet.js'
import { WalletKitManager } from '../managers/walletkit.js'

// -- Constants ----------------------------------------------------------------
const namespaces: ChainNamespace[] = ['eip155', 'solana', 'bip122']

// -- Types --------------------------------------------------------------------
type BuildNamespaceParameters = {
  namespace: ChainNamespace
  params: WalletKitTypes.SessionProposal['params']
  disabledIds: string[]
  walletManager: WalletManager
  connectToSingleAccount: boolean
}

export class WalletPage {
  public connectToSingleAccount = false
  public page: Page
  public isPageLoaded = false
  public walletKitManager: WalletKitManager | null = null
  public walletManager: WalletManager | null = null
  public shouldRejectSigning = false

  constructor(page: Page) {
    this.page = page
  }

  async load() {
    this.walletKitManager = new WalletKitManager()
    this.walletManager = new WalletManager({ namespaces })
    await this.walletKitManager.init()
    this.isPageLoaded = true
  }

  setShouldRejectSigning(shouldRejectSigning: boolean) {
    this.shouldRejectSigning = shouldRejectSigning
  }

  /**
   * Connect by inserting provided URI into the input element
   */

  async connectWithUri(uri: string, disabledChainIds: (string | number)[] = []) {
    const walletKitManager = this.walletKitManager
    const walletManager = this.walletManager

    if (!walletKitManager) {
      throw new Error('WalletKitManager not initialized')
    }

    if (!walletManager) {
      throw new Error('WalletManager not initialized')
    }

    return new Promise((resolve, reject) => {
      walletKitManager.listenEvents({
        onSessionProposal: async event =>
          this.onSessionProposal(event, disabledChainIds).then(resolve).catch(reject),
        onSessionRequest: event => this.onSessionRequest(event)
      })

      walletKitManager.pair(uri).catch(reject)
    })
  }

  async switchNetwork(network: string) {
    if (!this.walletKitManager) {
      throw new Error('WalletKit not initialized')
    }

    if (!this.walletManager) {
      throw new Error('WalletManager not initialized')
    }

    const walletkit = this.walletKitManager.getWalletKit()

    const sessions = walletkit.getActiveSessions()

    const [namespace, chainId] = network.split(':')

    if (!namespace) {
      throw new Error('Invalid namespace')
    }

    if (!chainId) {
      throw new Error('Invalid chainId')
    }

    const [address] = this.walletManager.getAccounts(
      namespace as ChainNamespace,
      this.connectToSingleAccount
    )

    if (!address) {
      throw new Error('No address found')
    }

    const caipAddress = `${network}:${address}`

    await Promise.all(
      Object.values(sessions).map(async session => {
        await walletkit.updateSession({
          topic: session.topic,
          namespaces: {
            ...session.namespaces,
            [namespace]: {
              ...session.namespaces[namespace],
              methods: session.namespaces?.[namespace]?.methods ?? [],
              events: session.namespaces?.[namespace]?.events ?? [],
              chains: [...new Set([network, ...(session?.namespaces?.[namespace]?.chains || [])])],
              accounts: [
                ...new Set([caipAddress, ...(session?.namespaces?.[namespace]?.accounts || [])])
              ]
            }
          }
        })

        await new Promise(resolve => {
          setTimeout(resolve, 1000)
        })

        const chainChanged = {
          topic: session.topic,
          event: {
            name: 'chainChanged',
            data: Number(chainId)
          },
          chainId: network
        }

        const accountsChanged = {
          topic: session.topic,
          event: {
            name: 'accountsChanged',
            data: [caipAddress]
          },
          chainId: network
        }

        await walletkit.emitSessionEvent(chainChanged)
        await walletkit.emitSessionEvent(accountsChanged)
      })
    )
  }

  /**
   * Disconnects the current connection in the wallet
   */
  async disconnectConnection() {
    if (!this.walletKitManager) {
      throw new Error('WalletKitManager not initialized')
    }

    const walletKit = this.walletKitManager.getWalletKit()
    const sessions = walletKit.getActiveSessions()

    await Promise.all(
      Object.values(sessions).map(session =>
        walletKit.disconnectSession({
          topic: session.topic,
          reason: getSdkError('USER_DISCONNECTED')
        })
      )
    )
  }

  /**
   * Sets a flag to indicate whether to connect to a single account
   * @param connectToSingleAccount boolean flag to set
   */
  setConnectToSingleAccount(connectToSingleAccount: boolean) {
    this.connectToSingleAccount = connectToSingleAccount
  }

  private async onSessionRequest(event: WalletKitTypes.SessionRequest) {
    const walletKitManager = this.walletKitManager
    const walletManager = this.walletManager

    if (!walletKitManager) {
      throw new Error('WalletKitManager not initialized')
    }

    if (!walletManager) {
      throw new Error('WalletManager not initialized')
    }

    const { topic, id } = event

    const walletKit = walletKitManager.getWalletKit()

    if (this.shouldRejectSigning) {
      return walletKit.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          error: {
            code: 5000,
            message: 'User rejected'
          }
        }
      })
    }

    const response = await this.handleSessionRequest(id, event)

    await walletKit.respondSessionRequest({
      topic,
      response
    })

    return null
  }

  async onSessionProposal(
    event: WalletKitTypes.SessionProposal,
    disabledChainIds: (string | number)[]
  ) {
    const walletKitManager = this.walletKitManager
    const walletManager = this.walletManager

    if (!walletKitManager) {
      throw new Error('WalletKitManager not initialized')
    }

    if (!walletManager) {
      throw new Error('WalletManager not initialized')
    }

    const { params, id } = event

    const optionalNamespaces: Partial<
      Record<ChainNamespace, BuildApprovedNamespacesParams['supportedNamespaces'][string]>
    > = {}

    for (const namespace of namespaces) {
      optionalNamespaces[namespace] = this.buildNamespaceForSessionProposal({
        namespace,
        params,
        disabledIds: [...new Set(disabledChainIds.map(chainId => chainId.toString()))],
        walletManager,
        connectToSingleAccount: this.connectToSingleAccount
      })
    }

    await walletKitManager.approveSession({
      id,
      params,
      namespaces: optionalNamespaces as BuildApprovedNamespacesParams['supportedNamespaces']
    })

    return null
  }

  private async handleSessionRequest(id: number, event: WalletKitTypes.SessionRequest) {
    const walletManager = this.walletManager

    if (!walletManager) {
      throw new Error('WalletManager not initialized')
    }

    const { request } = event.params

    const method = request.method

    if (DEFAULT_METHODS.eip155.includes(method)) {
      const message = fromHex(request.params[0], 'string')
      const signed = await walletManager.signMessage(message, ConstantsUtil.CHAIN.EVM)

      return formatJsonRpcResult(id, signed)
    }

    if (DEFAULT_METHODS.solana.includes(method)) {
      const message = request.params.message as string
      const signed = await walletManager.signMessage(message, ConstantsUtil.CHAIN.SOLANA)

      return formatJsonRpcResult(id, { signature: signed })
    }

    if (DEFAULT_METHODS.bip122.includes(method)) {
      const message = request.params[0] as string
      const signed = await walletManager.signMessage(message, ConstantsUtil.CHAIN.BITCOIN)
      const address = walletManager.getAddress(ConstantsUtil.CHAIN.BITCOIN)

      return formatJsonRpcResult(id, { signature: signed, address })
    }

    throw new Error(`Unsupported method: ${method}`)
  }

  private buildNamespaceForSessionProposal({
    namespace,
    params,
    disabledIds,
    walletManager,
    connectToSingleAccount
  }: BuildNamespaceParameters) {
    const namespaceProperties = params.optionalNamespaces?.[namespace] ?? {
      chains: [],
      methods: [],
      events: []
    }

    const accounts = walletManager.getAccounts(namespace, connectToSingleAccount)

    const filteredChains =
      namespaceProperties.chains?.filter(chain => {
        const chainId = chain.split(':')[1]

        return chainId ? !disabledIds.includes(chainId) : true
      }) ?? []

    const accountsWithChains = accounts.flatMap(account =>
      filteredChains.map(chain => `${chain}:${account}`)
    )

    return {
      ...namespaceProperties,
      chains: filteredChains,
      accounts: accountsWithChains
    }
  }
}
