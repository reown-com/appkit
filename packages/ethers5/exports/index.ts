import { AppKit } from '@rerock/base'
import type { AppKitOptions } from '@rerock/base'
import { EVMEthers5Client, type AdapterOptions } from '@rerock/adapter-ethers5'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@rerock/adapter-ethers5'

// -- Setup -------------------------------------------------------------
type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  const ethers5Adapter = new EVMEthers5Client()

  return new AppKit({
    ...options,
    adapters: [ethers5Adapter]
  })
}
