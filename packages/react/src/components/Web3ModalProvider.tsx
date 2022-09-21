import type { ConfigOptions } from '@web3modal/core'
import { ClientCtrl, ConfigCtrl } from '@web3modal/core'
import type { ReactNode } from 'react'
import React, { useCallback, useEffect } from 'react'
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
  const onConfigure = useCallback(async () => {
    import('@web3modal/ui')
    ConfigCtrl.setConfig(config)
    if (config.ethereum) await ClientCtrl.setEthereumClient(config.ethereum)
  }, [config])

  useEffect(() => {
    onConfigure()
  }, [onConfigure])

  return (
    <>
      {children}
      <Modal />
    </>
  )
}
