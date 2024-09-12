import { AppKit } from '@rerock/base'
import type { AppKitOptions } from '@rerock/base'
import { EVMWagmiClient, type AdapterOptions } from '@rerock/appkit-adapter-wagmi'
import type { Config } from 'wagmi'
import { ConstantsUtil } from '@rerock/scaffold-utils'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@rerock/appkit-adapter-wagmi'

// -- Connectors --------------------------------------------------------
export { authConnector } from '@rerock/appkit-adapter-wagmi'

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
    sdkVersion: `html-wagmi-${ConstantsUtil.VERSION}`,
    adapters: [wagmiAdapter]
  })
}
