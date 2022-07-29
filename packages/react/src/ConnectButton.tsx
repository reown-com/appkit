import { ConnectButtonWC } from '@web3modal/core'
import React, { useEffect } from 'react'

/**
 * Component
 */
export default function ConnectButton(props: Partial<ConnectButtonWC>) {
  useEffect(() => {
    import('@web3modal/core')
  }, [])

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
