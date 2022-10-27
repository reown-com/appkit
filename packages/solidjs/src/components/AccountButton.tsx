import type { W3mAccountButton } from '@web3modal/ui'
/**
 * Component
 */
export function AccountButton(props: JSX.IntrinsicElements['w3m-account-button']) {
  return <w3m-account-button {...props} />
}

/**
 * Types
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-account-button': Partial<W3mAccountButton>
    }
  }
}
declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-account-button': Partial<W3mAccountButton>
    }
  }
}
