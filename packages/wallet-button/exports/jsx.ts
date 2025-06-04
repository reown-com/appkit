import type { AppKitWalletButton } from './index.js'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'appkit-wallet-button': Pick<AppKitWalletButton, 'wallet'>
    }
  }
}
