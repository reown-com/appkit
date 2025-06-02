import type {
  AppKitAccountButton,
  AppKitButton,
  AppKitConnectButton,
  AppKitNetworkButton,
  W3mAccountButton,
  W3mButton,
  W3mConnectButton,
  W3mNetworkButton
} from '@reown/appkit-scaffold-ui'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'appkit-modal': {
        class?: string
      }
      'appkit-button': Pick<
        AppKitButton,
        'size' | 'label' | 'loadingLabel' | 'disabled' | 'balance' | 'namespace'
      >
      'appkit-connect-button': Pick<AppKitConnectButton, 'size' | 'label' | 'loadingLabel'>
      'appkit-account-button': Pick<AppKitAccountButton, 'disabled' | 'balance'>
      'appkit-network-button': Pick<AppKitNetworkButton, 'disabled'>
      'w3m-connect-button': Pick<W3mConnectButton, 'size' | 'label' | 'loadingLabel'>
      'w3m-account-button': Pick<W3mAccountButton, 'disabled' | 'balance'>
      'w3m-button': Pick<W3mButton, 'size' | 'label' | 'loadingLabel' | 'disabled' | 'balance'>
      'w3m-network-button': Pick<W3mNetworkButton, 'disabled'>
    }
  }
}
