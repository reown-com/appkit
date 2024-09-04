import { AppKit } from '@web3modal/base'
import type { AppKitOptions } from '@web3modal/base'
import { EVMEthersClient, type AdapterOptions } from '@web3modal/adapter-ethers'
import { type EthersStoreUtilState } from '@web3modal/scaffold-utils/ethers'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@web3modal/adapter-ethers'

// -- Setup -------------------------------------------------------------
export type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  const ethersAdapter = new EVMEthersClient()

  return new AppKit<EthersStoreUtilState, number>({
    ...options,
    adapters: [ethersAdapter]
  })
}
