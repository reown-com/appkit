import type { Address, Chain, Config } from '@wagmi/core'
import {
  disconnect,
  fetchBalance,
  fetchEnsAvatar,
  fetchEnsName,
  getAccount,
  getNetwork,
  switchNetwork,
  watchAccount,
  watchNetwork
} from '@wagmi/core'
import { mainnet } from '@wagmi/core/chains'
import type {
  CaipAddress,
  CaipChainId,
  ConnectionControllerClient,
  NetworkControllerClient
} from '@web3modal/scaffold-html'
import { Web3ModalScaffoldHtml } from '@web3modal/scaffold-html'

// -- Helpers -------------------------------------------------------------------
const WALLET_CONNECT_ID = 'walletConnect'
const NAMESPACE = 'eip155'

// -- Types ---------------------------------------------------------------------
export interface Web3ModalOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wagmiConfig?: Config<any, any>
}

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffoldHtml {
  public constructor(options: Web3ModalOptions) {
    const { wagmiConfig } = options

    if (!wagmiConfig) {
      throw new Error('wagmi:constructor - wagmiConfig is undefined')
    }

    const networkControllerClient: NetworkControllerClient = {
      async switchNetwork(chainId) {
        const chainIdNumber = Number(chainId)
        await switchNetwork({ chainId: chainIdNumber })
      }
    }

    const connectionControllerClient: ConnectionControllerClient = {
      async connectWalletConnect(onUri) {
        const connector = wagmiConfig.connectors.find(c => c.id === WALLET_CONNECT_ID)
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

      async connectExternal(id) {
        const connector = wagmiConfig.connectors.find(c => c.id === id)
        if (!connector) {
          throw new Error('connectionControllerClient:connectExternal - connector is undefined')
        }

        await connector.connect()
      },

      disconnect
    }

    super({
      networkControllerClient,
      connectionControllerClient
    })

    this.syncConnectors(wagmiConfig)

    this.syncAccount()
    watchAccount(() => this.syncAccount())

    this.syncNetwork()
    watchNetwork(() => this.syncNetwork())
  }

  // -- Private ------------------------------------------------------------------
  private async syncAccount() {
    const { address, isConnected } = getAccount()
    const { chain } = getNetwork()
    if (address && chain) {
      const caipAddress: CaipAddress = `${NAMESPACE}:${chain.id}:${address}`
      this.setIsConnected(isConnected)
      this.setAddress(caipAddress)
      await Promise.all([this.syncProfile(address), this.syncBalance(address, chain)])
    }
  }

  private async syncNetwork() {
    const { address } = getAccount()
    const { chain } = getNetwork()
    if (chain) {
      const chainId = String(chain.id)
      const caipChainId: CaipChainId = `${NAMESPACE}:${chainId}`
      this.setNetwork(caipChainId)
      if (address) {
        await this.syncBalance(address, chain)
      }
    }
  }

  private async syncProfile(address: Address) {
    const profileName = await fetchEnsName({ address, chainId: mainnet.id })
    if (profileName) {
      this.setProfileName(profileName)
      const profileImage = await fetchEnsAvatar({ name: profileName, chainId: mainnet.id })
      if (profileImage) {
        this.setProfileImage(profileImage)
      }
    }
  }

  private async syncBalance(address: Address, chain: Chain) {
    const balance = await fetchBalance({ address, chainId: chain.id })
    this.setBalance(balance.formatted)
  }

  private syncConnectors(wagmiConfig: Web3ModalOptions['wagmiConfig']) {
    const connectors = wagmiConfig?.connectors.map(
      connector =>
        ({
          id: connector.id,
          name: connector.id === 'injected' ? 'Browser Wallet' : connector.name,
          type: connector.id === WALLET_CONNECT_ID ? 'WALLET_CONNECT' : 'EXTERNAL'
        }) as const
    )
    this.setConnectors(connectors ?? [])
  }
}
