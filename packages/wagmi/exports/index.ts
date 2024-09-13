import { AppKit } from '@reown/appkit'
import type { AppKitOptions } from '@reown/appkit'
import { EVMWagmiClient, type AdapterOptions } from '@reown/appkit-adapter-wagmi'
import type { Config } from 'wagmi'
import packageJson from '../package.json' assert { type: 'json' }

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@reown/appkit-adapter-wagmi'

// -- Connectors --------------------------------------------------------
export { authConnector } from '@reown/appkit-adapter-wagmi'

// -- Setup -------------------------------------------------------------
export type WagmiAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions<Config>

export function createWeb3Modal(options: WagmiAppKitOptions) {
  const wagmiAdapter = new EVMWagmiClient({
    caipNetworks: options.caipNetworks,
    projectId: options.projectId
  })

  return new AppKit({
    ...options,
    sdkVersion: `html-wagmi-${packageJson.version}`,
    adapters: [wagmiAdapter]
  })
}
