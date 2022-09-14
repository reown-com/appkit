import type { W3mAccountModal } from '@web3modal/ui'
import React from 'react'

/**
 * Component
 */
export function AccountModal(props: JSX.IntrinsicElements['w3m-account-modal']) {
  return <w3m-account-modal {...props} />
}

/**
 * Types
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-account-modal': Partial<W3mAccountModal>
    }
  }
}
