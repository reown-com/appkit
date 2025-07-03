/* eslint-disable no-await-in-loop */
import { type Page } from '@playwright/test'
import { type BuildApprovedNamespacesParams, getSdkError } from '@walletconnect/utils'
import { fromHex } from 'viem'

import type { ChainNamespace } from '@reown/appkit-common'

import { WalletManager } from '../managers/wallet.js'
import { WalletKitManager } from '../managers/walletkit.js'

const namespaces: ChainNamespace[] = ['eip155', 'solana', 'bip122']

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

  async connectWithUri(uri: string, disabledChainIds: (string | number)[]) {
    if (!this.walletKitManager) {
      throw new Error('WalletKitManager not initialized')
    }

    return new Promise((resolve, reject) => {
      this.walletKitManager?.listenEvents({
        onSessionProposal: async ({ id, params }) => {
          const optionalNamespaces: Record<
            ChainNamespace,
            BuildApprovedNamespacesParams['supportedNamespaces']
          > = {}

          for (const namespace of namespaces) {
            const optionalNamespaceProperties =
              params.optionalNamespaces?.[namespace as keyof typeof params.optionalNamespaces]

            const accounts =
              this.walletManager?.getAccounts(namespace, this.connectToSingleAccount) ?? []
            const chains = optionalNamespaceProperties?.chains ?? []

            const filteredChains = chains.filter(chain => {
              const chainId = chain.split(':')[1]

              if (chainId) {
                return !disabledChainIds.map(_chainId => _chainId.toString()).includes(chainId)
              }

              return true
            })

            const accountsWithChains = accounts.flatMap(account =>
              filteredChains.map(chain => `${chain}:${account}`)
            )

            optionalNamespaces[namespace] = {
              ...optionalNamespaceProperties,
              chains: filteredChains,
              accounts: accountsWithChains
            }
          }

          await this.walletKitManager
            ?.approveSession({
              id,
              params,
              namespaces: optionalNamespaces
            })
            .then(resolve)
            .catch(reject)
        },
        onSessionRequest: async event => {
          const { topic, params, id } = event

          const walletKit = this.walletKitManager?.getWalletKit()

          if (this.shouldRejectSigning) {
            await walletKit?.respondSessionRequest({
              topic,
              response: {
                id,
                jsonrpc: '2.0',
                error: {
                  code: 5000,
                  message: 'User rejected.'
                }
              }
            })
          } else {
            const { request } = params

            const message = fromHex(request.params[0], 'string')

            const signedMessage = await this.walletManager?.signMessage(message)

            const response = { id, result: signedMessage, jsonrpc: '2.0' }

            await walletKit?.respondSessionRequest({ topic, response })
          }
        }
      })

      this.walletKitManager?.pair(uri).catch(reject)
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

    const [address] = this.walletManager.getAccounts()

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
}
