import { AppKit } from '@web3modal/base'
import type { AppKitOptions } from '@web3modal/base'
import { EVMWagmiClient, type AdapterOptions } from '@web3modal/base/adapters/evm/wagmi'
import type { Config } from 'wagmi'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@web3modal/base/adapters/evm/wagmi'

// -- Connectors --------------------------------------------------------
export { authConnector } from '@web3modal/base/adapters/evm/wagmi'

// -- Configs -----------------------------------------------------------
export { defaultWagmiConfig } from '@web3modal/base/adapters/evm/wagmi'

// -- Setup -------------------------------------------------------------
export type WagmiAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions<Config>

export function createWeb3Modal(options: WagmiAppKitOptions) {
  const wagmiAdapter = new EVMWagmiClient()

  return new AppKit({
    ...options,
    adapters: [wagmiAdapter]
  })
}
