import type { W3mQrCode as TW3mQrCode } from '@web3modal/ui'
import React from 'react'

/**
 * Component
 */
export function W3mQrCode(props: JSX.IntrinsicElements['w3m-qrcode']) {
  const { size } = props

  return (
    <div style={{ width: size, height: size }}>
      <w3m-qrcode {...props} />
    </div>
  )
}

/**
 * Types
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-qrcode': Partial<TW3mQrCode>
    }
  }
}
