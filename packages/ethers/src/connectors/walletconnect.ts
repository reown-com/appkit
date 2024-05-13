import type { EthereumProvider, EthereumProviderOptions } from '@walletconnect/ethereum-provider'
import type { Provider } from '../utils/EthersTypesUtil.js'
import { Injected } from './injected.js'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { EthersStoreUtil } from '../utils/EthersStoreUtil.js'
import { EthersConstantsUtil } from '../utils/EthersConstantsUtil.js'

type WCProvider = Awaited<ReturnType<typeof EthereumProvider.init>>

export class WalletConnectConnector extends Injected {
  provider?: WCProvider
  options: EthereumProviderOptions

  constructor(options: EthereumProviderOptions) {
    super({
      id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
      type: 'WALLET_CONNECT',
      getProvider: () => this.provider as unknown as Provider
    })
    this.options = options
  }

  override async checkActive() {
    // eslint-disable-next-line no-shadow
    const { EthereumProvider } = await import('@walletconnect/ethereum-provider')

    this.provider = await EthereumProvider.init(this.options)
  }

  override async disconnect() {
    const provider = (await this.getProvider()) as unknown as WCProvider

    localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
    EthersStoreUtil.reset()
    try {
      EthersStoreUtil.setError(undefined)
      provider?.disconnect()
    } catch (error) {
      EthersStoreUtil.setError(error)
    }
  }
}
