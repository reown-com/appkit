import type { AppKitOptions } from '@web3modal/base'
import type { AdapterOptions } from '@web3modal/base/adapters/solana/web3js'

export type SolanaAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions
