import '@reown/appkit-polyfills'
import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import * as AppKitNetworks from '@reown/appkit/networks'

const networks = AppKitNetworks

// Export the createAppKit function and other necessary exports
export { createAppKit, networks, WagmiAdapter, SolanaAdapter }

// If you're using a global object, make sure it's properly defined
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
