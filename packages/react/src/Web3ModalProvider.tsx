import type { ConfigOptions } from '@web3modal/core'
import { Web3ModalCore } from '@web3modal/core'
import type { ReactNode } from 'react'
import React, { useEffect } from 'react'
import { Web3Modal as Modal } from './Web3Modal'

/**
 * Props
 */
interface Props {
  children: ReactNode | ReactNode[]
  config: ConfigOptions
}

/**
 * Component
 */
export function Web3ModalProvider({ children, config }: Props) {
  async function onConfigure() {
    Web3ModalCore.configure(config)
    await import('@web3modal/ui')
  }

  useEffect(() => {
    onConfigure()
  }, [])

  return (
    <>
      {children}
      <Modal />
    </>
  )
}
