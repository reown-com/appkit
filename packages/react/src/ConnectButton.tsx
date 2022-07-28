import '@web3modal/core/src/connect-button'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

/**
 * Component
 */
export default function ConnectButton() {
  return (
    <>
      <connect-button label="sss" />
    </>
  )
}

/**
 * Types
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'connect-button': DetailedHTMLProps<
        HTMLAttributes<HTMLElementTagNameMap['connect-button']>,
        HTMLElementTagNameMap['connect-button']
      >
    }
  }
}
