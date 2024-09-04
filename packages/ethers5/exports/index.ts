import { AppKit } from '@web3modal/base'
import type { AppKitOptions } from '@web3modal/base'
import { EVMEthers5Client, type AdapterOptions } from '@web3modal/adapter-ethers5'
import { type EthersStoreUtilState } from '@web3modal/scaffold-utils/ethers'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@web3modal/adapter-ethers5'

// -- Setup -------------------------------------------------------------
type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  const ethers5Adapter = new EVMEthers5Client()

  return new AppKit<EthersStoreUtilState, number>({
    ...options,
    adapters: [ethers5Adapter]
  })
}
