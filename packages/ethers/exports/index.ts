import { AppKit } from '@web3modal/base'
import type { AppKitOptions } from '@web3modal/base'
import { EVMEthersClient, type AdapterOptions } from '@web3modal/base/adapters/evm/ethers'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { type Chain, type EthersStoreUtilState } from '@web3modal/scaffold-utils/ethers'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@web3modal/base/adapters/evm/ethers'

// -- Configs -----------------------------------------------------------
export { defaultConfig } from '@web3modal/base/adapters/evm/ethers'

// -- Setup -------------------------------------------------------------
export type EthersAppKitOptions = Omit<
  AppKitOptions<Chain>,
  'adapters' | 'sdkType' | 'sdkVersion'
> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  const ethersAdapter = new EVMEthersClient({
    ethersConfig: options.ethersConfig,
    siweConfig: options.siweConfig,
    chains: options.chains,
    defaultChain: options.defaultChain
  })

  return new AppKit<EthersStoreUtilState, number>({
    ...options,
    defaultChain: ethersAdapter.defaultChain,
    adapters: [ethersAdapter],
    sdkType: 'w3m',
    sdkVersion: `html-ethers-${ConstantsUtil.VERSION}`
  })
}
