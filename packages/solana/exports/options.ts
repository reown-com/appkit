import type { AppKitOptions } from '@reown/appkit'
import type { AdapterOptions } from '@reown/appkit-adapter-solana'

export type SolanaAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions
