import { AppKit } from '@reown/appkit'
import type { AppKitOptions } from '@reown/appkit'
import { EVMEthersClient, type AdapterOptions } from '@reown/appkit-adapter-ethers'
import { ConstantsUtil } from '@reown/appkit-utils'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@reown/appkit-adapter-ethers'

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
