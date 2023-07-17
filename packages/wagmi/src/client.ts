import type { Address, Chain, Config } from '@wagmi/core'
import {
  connect,
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
      async switchCaipNetwork(caipChainId) {
        const chainId = caipChainId?.split(':')[1]
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

        connector.on('message', event => {
          if (event.type === 'display_uri') {
            onUri(event.data as string)
            connector.removeAllListeners()
          }
        })

        await connect({ connector })
      },

      async connectExternal(id) {
        const connector = wagmiConfig.connectors.find(c => c.id === id)
        if (!connector) {
          throw new Error('connectionControllerClient:connectExternal - connector is undefined')
        }

        await connect({ connector })
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

  // -- Private -----------------------------------------------------------------
  private async syncAccount() {
    const { address, isConnected } = getAccount()
    const { chain } = getNetwork()
    this.resetAccount()
    if (isConnected && address && chain) {
      this.resetWcConnection()
      const caipAddress: CaipAddress = `${NAMESPACE}:${chain.id}:${address}`
      this.setIsConnected(isConnected)
      this.setCaipAddress(caipAddress)
      await Promise.all([this.syncProfile(address), this.syncBalance(address, chain)])
    }
  }

  private async syncNetwork() {
    const { address, isConnected } = getAccount()
    const { chain } = getNetwork()
    if (chain) {
      const chainId = String(chain.id)
      const caipChainId: CaipChainId = `${NAMESPACE}:${chainId}`
      this.setCaipNetwork(caipChainId)
      if (isConnected && address) {
        const caipAddress: CaipAddress = `${NAMESPACE}:${chain.id}:${address}`
        this.setCaipAddress(caipAddress)
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
