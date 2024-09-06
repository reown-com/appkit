import { AppKit } from '@web3modal/base'
import type { AppKitOptions } from '@web3modal/base'
import { EVMWagmiClient, type AdapterOptions } from '@web3modal/adapter-wagmi'
import type { Config } from 'wagmi'
import { ConstantsUtil } from '@web3modal/scaffold-utils'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@web3modal/adapter-wagmi'

// -- Connectors --------------------------------------------------------
export { authConnector } from '@web3modal/adapter-wagmi'

// -- Setup -------------------------------------------------------------
export type WagmiAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions<Config>

export function createWeb3Modal(options: WagmiAppKitOptions) {
  const wagmiAdapter = new EVMWagmiClient()

  return new AppKit({
    ...options,
    sdkVersion: `html-wagmi-${ConstantsUtil.VERSION}`,
    adapters: [wagmiAdapter]
  })
}
