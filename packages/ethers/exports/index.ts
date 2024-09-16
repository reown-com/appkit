import { AppKit } from '@reown/appkit'
import type { AppKitOptions } from '@reown/appkit'
import { EVMEthersClient, type AdapterOptions } from '@reown/appkit-adapter-ethers'
import packageJson from '../package.json' assert { type: 'json' }

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@reown/appkit-adapter-ethers'

// -- Setup -------------------------------------------------------------
export type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createAppKit(options: EthersAppKitOptions) {
  const ethersAdapter = new EVMEthersClient()

  return new AppKit({
    ...options,
    sdkVersion: `html-ethers-${packageJson.version}`,
    adapters: [ethersAdapter]
  })
}
