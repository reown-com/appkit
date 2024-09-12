import { AppKit } from '@rerock/appkit'
import type { AppKitOptions } from '@rerock/appkit'
import { EVMEthersClient, type AdapterOptions } from '@rerock/appkit-adapter-ethers'
import { ConstantsUtil } from '@rerock/scaffold-utils'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@rerock/appkit-adapter-ethers'

// -- Setup -------------------------------------------------------------
export type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  const ethersAdapter = new EVMEthersClient()

  return new AppKit({
    ...options,
    sdkVersion: `html-ethers-${ConstantsUtil.VERSION}`,
    adapters: [ethersAdapter]
  })
}
