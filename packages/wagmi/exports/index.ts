import { AppKit } from '@web3modal/base'
import type { AppKitOptions, ChainAdapter } from '@web3modal/base'
import { EVMWagmiClient, type AdapterOptions } from '@web3modal/base/adapters/evm/wagmi'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import type { Config } from 'wagmi'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@web3modal/base/adapters/evm/wagmi'

// -- Connectors --------------------------------------------------------
export { authConnector } from '@web3modal/base/adapters/evm/wagmi'

// -- Configs -----------------------------------------------------------
export { defaultWagmiConfig } from '@web3modal/base/adapters/evm/wagmi'

// -- Setup -------------------------------------------------------------
type WagmiAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions<Config>

export function createWeb3Modal(options: WagmiAppKitOptions) {
  const wagmiAdapter = new EVMWagmiClient() as ChainAdapter

  return new AppKit({
    ...options,
    adapters: [wagmiAdapter],
    sdkType: 'w3m',
    sdkVersion: `html-wagmi-${ConstantsUtil.VERSION}`
  })
}
