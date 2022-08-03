import { ConnectButtonW3M } from '@web3modal/core'
import React from 'react'

/**
 * Component
 */
export function ConnectButton(props: JSX.IntrinsicElements['connect-button']) {
  return <connect-button {...props} />
}

/**
 * Types
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'connect-button': Pick<ConnectButtonW3M, 'label'>
    }
  }
}
