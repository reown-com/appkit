import { ConnectButtonWC } from '@web3modal/core'
import React from 'react'

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
