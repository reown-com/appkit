import type { Config } from '@wagmi/core'
import {
  disconnect,
  fetchBalance,
  fetchEnsAvatar,
  fetchEnsName,
  getAccount,
  getNetwork,
  switchNetwork
} from '@wagmi/core'
import type {
  AccountControllerClient,
  ConnectionControllerClient,
  NetworkControllerClient
} from '@web3modal/core'
import { Web3ModalScaffoldHtml } from '@web3modal/scaffold-html'

// -- Helpers -------------------------------------------------------------------
const WALLET_CONNECT_ID = 'walletconnect'
const INJECTED_ID = 'injected'

// -- Types ---------------------------------------------------------------------
export interface Web3ModalOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wagmiClient?: Config<any, any>
}

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffoldHtml {
  public constructor(options: Web3ModalOptions) {
    const { wagmiClient } = options

    if (!wagmiClient) {
      throw new Error('wagmi:constructor - wagmiClient is undefined')
    }

    const accountControllerClient: AccountControllerClient = {
      async getAddress() {
        const { address } = getAccount()
        if (!address) {
          throw new Error('accountControllerClient:getAddress - address is undefined')
        }

        return Promise.resolve(address)
      },

      async getBalance(address) {
        if (!address) {
          throw new Error('accountControllerClient:getBalance - address is undefined')
        }
        const { formatted } = await fetchBalance({ address } as { address: `0x${string}` })
        if (!formatted) {
          throw new Error('accountControllerClient:getBalance - formatted is undefined')
        }

        return formatted
      },

      async getProfile(address) {
        if (!address) {
          throw new Error('accountControllerClient:getProfile - address is undefined')
        }
        const name = await fetchEnsName({ address } as { address: `0x${string}` })
        let image = undefined
        if (name) {
          image = await fetchEnsAvatar({ name })
        }

        return {
          name: name ?? undefined,
          image: image ?? undefined
        }
      }
    }

    const networkControllerClient: NetworkControllerClient = {
      async getActiveNetwork() {
        const { chain } = getNetwork()
        if (!chain) {
          throw new Error('wagmi:networkControllerClient:getActiveNetwork - chain is undefined')
        }
        const chainId = String(chain.id)

        return Promise.resolve(chainId)
      },

      async getRequestedNetworks() {
        const { chains } = wagmiClient
        const chainIds = chains?.map(chain => String(chain.id))

        return Promise.resolve(chainIds ?? [])
      },

      async getApprovedNetworks() {
        const { chains } = getNetwork()
        const chainIds = chains.map(chain => String(chain.id))

        return Promise.resolve(chainIds)
      },

      async switchActiveNetwork(chainId) {
        const chainIdNumber = Number(chainId)
        await switchNetwork({ chainId: chainIdNumber })
      }
    }

    const connectionControllerClient: ConnectionControllerClient = {
      async connectWalletConnect(onUri) {
        const connector = wagmiClient.connectors.find(c => c.name === WALLET_CONNECT_ID)
        if (!connector) {
          throw new Error('connectionControllerClient:getWalletConnectUri - connector is undefined')
        }
        connector.once('message', event => {
          if (event.type === 'display_uri') {
            onUri(event.data as string)
          }
        })

        await connector.connect()
      },

      async connectBrowserExtension(_id) {
        const connector = wagmiClient.connectors.find(c => c.name === INJECTED_ID)
        if (!connector) {
          throw new Error(
            'connectionControllerClient:connectBrowserExtension - connector is undefined'
          )
        }

        await connector.connect()
      },

      async connectThirdPartyWallet(id) {
        const connector = wagmiClient.connectors.find(c => c.name === id)
        if (!connector) {
          throw new Error(
            'connectionControllerClient:connectThirdPartyWallet - connector is undefined'
          )
        }

        await connector.connect()
      },

      disconnect
    }

    super({
      accountControllerClient,
      networkControllerClient,
      connectionControllerClient
    })
  }
}
