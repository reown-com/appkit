/**
 * Due to some limitations on exporting multiple modules with UMD, we needed to export all of our modules in this file.
 * For now exporting only Wagmi and Solana adapters. Until we found a better workaround and need other adapters, we can keep it this way.
 */
import '@reown/appkit-polyfills'

export * as AppKit from '@reown/appkit'
export * as AppKitNetworks from '@reown/appkit/networks'
export * as WagmiAdapter from '@reown/appkit-adapter-wagmi'
export * as SolanaAdapter from '@reown/appkit-adapter-solana'
export * as Viem from 'viem'
export * as Connectors from '@wagmi/connectors'
export * as WagmiCore from '@wagmi/core'

// -- Global AppKit object -------------------------------- //
declare global {
  interface Window {
    AppKit: any
    WagmiAdapter: any
    SolanaAdapter: any
    AppKitNetworks: any
    Viem: any
    Connectors: any
    WagmiCore: any
  }
}

// Assign to window.AppKit
if (typeof window !== 'undefined') {
  // @ts-expect-error no types for this
  window.AppKit = AppKit
  // @ts-expect-error no types for this
  window.WagmiAdapter = WagmiAdapter
  // @ts-expect-error no types for this
  window.SolanaAdapter = SolanaAdapter
  // @ts-expect-error no types for this
  window.AppKitNetworks = AppKitNetworks
  // @ts-expect-error no types for this
  window.Viem = Viem
  // @ts-expect-error no types for this
  window.Connectors = Connectors
  // @ts-expect-error no types for this
  window.WagmiCore = WagmiCore
}
