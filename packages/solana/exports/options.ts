import type { AppKitOptions } from '@rerock/base'
import type { AdapterOptions } from '@rerock/adapter-solana'

export type SolanaAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions
