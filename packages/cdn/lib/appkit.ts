/**
 * Due to some limitations on exporting multiple modules with UMD, we needed to export all of our modules in this file.
 * For now exporting only Wagmi and Solana adapters. Until we found a better workaround and need other adapters, we can keep it this way.
 */
import { AppKit, type AppKitOptions, CoreHelperUtil } from '@reown/appkit'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import '@reown/appkit-polyfills'
import { PACKAGE_VERSION } from '@reown/appkit/constants'
import * as AppKitNetworks from '@reown/appkit/networks'

// -- Export Wagmi ------------------------------------------- //
export * as Viem from 'viem'
export * as Connectors from '@wagmi/connectors'
export * as WagmiCore from '@wagmi/core'

const networks = AppKitNetworks

type CreateAppKit = Omit<AppKitOptions, 'sdkType' | 'sdkVersion' | 'basic'> & {
  isUnity?: boolean
}

function createAppKit(options: CreateAppKit) {
  return new AppKit({
    ...options,
    sdkVersion: CoreHelperUtil.generateSdkVersion(
      options.adapters ?? [],
      options.isUnity ? 'unity' : 'cdn',
      PACKAGE_VERSION
    )
  })
}

export { createAppKit, networks, WagmiAdapter, SolanaAdapter }

declare global {
  interface Window {
    AppKit: {
      createAppKit: typeof createAppKit
      WagmiAdapter: typeof WagmiAdapter
      SolanaAdapter: typeof SolanaAdapter
      networks: typeof AppKitNetworks
    }
  }
}

// Assign to window.AppKit
if (typeof window !== 'undefined') {
  window.AppKit = {
    createAppKit,
    WagmiAdapter,
    SolanaAdapter,
    networks: AppKitNetworks
  }
}
