import type { AppKitOptions } from '@rerock/appkit'
import type { AdapterOptions } from '@rerock/appkit-adapter-solana'

export type SolanaAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions
