import { AppKit } from '@reown/appkit'
import type { AppKitOptions } from '@reown/appkit'
import { EVMEthers5Client, type AdapterOptions } from '@reown/appkit-adapter-ethers5'
import { ConstantsUtil } from '@reown/appkit-utils'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@reown/appkit-adapter-ethers5'

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
