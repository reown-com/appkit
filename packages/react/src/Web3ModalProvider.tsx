import React, { ReactNode, useEffect } from 'react'

/**
 * Props
 */
interface Props {
  children: ReactNode | ReactNode[]
}

/**
 * Component
 */
export function Web3ModalProvider({ children }: Props) {
  async function onConfigure() {
    await import('@web3modal/ui')
  }

  useEffect(() => {
    onConfigure()
  }, [])

  return <>{children}</>
}
