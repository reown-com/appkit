import { AppKit } from '@rerock/appkit'
import type { AppKitOptions } from '@rerock/appkit'
import { EVMEthers5Client, type AdapterOptions } from '@rerock/appkit-adapter-ethers5'
import { ConstantsUtil } from '@rerock/scaffold-utils'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@rerock/appkit-adapter-ethers5'

// -- Setup -------------------------------------------------------------
type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  const ethers5Adapter = new EVMEthers5Client()

  return new AppKit({
    ...options,
    sdkVersion: `html-ethers5-${ConstantsUtil.VERSION}`,
    adapters: [ethers5Adapter]
  })
}
