import { W3mConnectButton } from '@web3modal/core'
import React from 'react'

/**
 * Component
 */
export function ConnectButton(props: JSX.IntrinsicElements['w3m-connect-button']) {
  return <w3m-connect-button {...props} />
}

/**
 * Types
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-connect-button': Pick<W3mConnectButton, 'label'>
    }
  }
}
