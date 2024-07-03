import { EVMWagmiClient } from '../../adapters/evm/wagmi/client.js'
import { AppKit } from '../../src/client.js'
import type { AppKitOptions } from '../../utils/TypesUtil.js'
import type { Config } from 'wagmi'

// -- Views ------------------------------------------------------------
export * from '@web3modal/scaffold-ui'

// -- Utils & Other -----------------------------------------------------
export type * from '@web3modal/core'
export { CoreHelperUtil } from '@web3modal/core'

type WagmiAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> & {
  wagmiConfig: Config
}

export function createAppKit(options: WagmiAppKitOptions) {
  const wagmiAdapter = new EVMWagmiClient({
    wagmiConfig: options.wagmiConfig
  })
  return new AppKit({
    ...options,
    adapters: [wagmiAdapter],
    sdkType: 'w3m',
    sdkVersion: 'html-wagmi-undefined'
  })
}

export { AppKit }
