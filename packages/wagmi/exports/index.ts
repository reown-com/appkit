import { AppKit } from '@web3modal/base'
import type { AppKitOptions } from '@web3modal/base'
import { EVMWagmiClient, type AdapterOptions } from '@web3modal/base/adapters/evm/wagmi'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import type { Chain } from 'viem'
import type { Config } from 'wagmi'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@web3modal/base/adapters/evm/wagmi'

// -- Connectors --------------------------------------------------------
export { authConnector } from '@web3modal/base/adapters/evm/wagmi'

// -- Configs -----------------------------------------------------------
export { defaultWagmiConfig } from '@web3modal/base/adapters/evm/wagmi'

// -- Setup -------------------------------------------------------------
export type WagmiAppKitOptions = Omit<AppKitOptions<Chain>, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions<Config>

export function createWeb3Modal(options: WagmiAppKitOptions) {
  const wagmiAdapter = new EVMWagmiClient({
    wagmiConfig: options.wagmiConfig,
    siweConfig: options.siweConfig,
    defaultChain: options.defaultChain
  })

  return new AppKit({
    ...options,
    defaultChain: wagmiAdapter.defaultChain,
    adapters: [wagmiAdapter],
    sdkType: 'w3m',
    sdkVersion: `html-wagmi-${ConstantsUtil.VERSION}`
  })
}
