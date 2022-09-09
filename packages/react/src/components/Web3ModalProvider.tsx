import type { ConfigOptions } from '@web3modal/core'
import { ClientCtrl, ConfigCtrl } from '@web3modal/core'
import type { EthereumClient } from '@web3modal/ethereum'
import type { ReactNode } from 'react'
import React, { useCallback, useEffect } from 'react'
import { Web3Modal as Modal } from './Web3Modal'

/**
 * Props
 */
interface Props {
  children: ReactNode | ReactNode[]
  config: ConfigOptions
  ethereumClient?: EthereumClient
}

/**
 * Component
 */
export function Web3ModalProvider({ children, config, ethereumClient }: Props) {
  const onConfigure = useCallback(async () => {
    ConfigCtrl.setConfig(config)
    if (ethereumClient) await ClientCtrl.setEthereumClient(ethereumClient)
    await import('@web3modal/ui')
  }, [config, ethereumClient])

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
