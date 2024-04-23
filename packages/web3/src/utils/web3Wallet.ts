import { Web3 } from 'web3'
import { type SupportedProviders } from 'web3'
import type { Chain } from '../scaffold-utils/Web3TypesUtil'

type ExtendedWeb3 = Web3 & {
  switchEthereumChain(params: { chainId: String }): Promise<null>
  addEthereumChain(chain: Chain): Promise<null>
}

// web3js wallet with extended methods for wallet
export class Web3Wallet {
  web3: ExtendedWeb3
  constructor(provider: SupportedProviders | string) {
    this.web3 = new Web3(provider) as ExtendedWeb3
    this.web3.extend({
      methods: [
        {
          name: 'switchEthereumChain',
          call: 'wallet_switchEthereumChain'
        },
        {
          name: 'addEthereumChain',
          call: 'wallet_addEthereumChain'
        }
      ]
    })
  }
}
