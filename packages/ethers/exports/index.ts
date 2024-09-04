import { AppKit } from '@rerock/base'
import type { AppKitOptions } from '@rerock/base'
import { EVMEthersClient, type AdapterOptions } from '@rerock/adapter-ethers'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@rerock/adapter-ethers'

// -- Setup -------------------------------------------------------------
export type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  const ethersAdapter = new EVMEthersClient()

  return new AppKit({
    ...options,
    adapters: [ethersAdapter]
  })
}
