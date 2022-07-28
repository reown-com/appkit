import type { ConnectButtonWC } from '@web3modal/core'

/**
 * Component
 */
export default function ConnectButton(props: Partial<ConnectButtonWC>) {
  return <connect-button {...props} />
}

/**
 * Types
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'connect-button': Partial<ConnectButtonWC>
    }
  }
}
