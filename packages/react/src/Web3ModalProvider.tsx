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
export default function Web3ModalProvider({ children }: Props) {
  useEffect(() => {
    import('@web3modal/core')
  }, [])

  return <>{children}</>
}
