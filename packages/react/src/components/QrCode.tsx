import type { W3mQrCode } from '@web3modal/ui'
import React, { useEffect } from 'react'

/**
 * Component
 */
export function QrCode(props: JSX.IntrinsicElements['w3m-qrcode']) {
  const { size } = props

  useEffect(() => {
    import('@web3modal/ui')
  })

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
      'w3m-qrcode': Partial<W3mQrCode>
    }
  }
}
