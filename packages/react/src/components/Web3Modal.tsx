import type { ConfigOptions } from '@web3modal/core'
import { ClientCtrl, ConfigCtrl } from '@web3modal/core'
import type { Web3ModalEthereum } from '@web3modal/ethereum'
import React, { useCallback, useEffect } from 'react'
import { Modal } from './Modal'

/**
 * Props
 */
interface Props extends ConfigOptions {
  ethereumClient?: typeof Web3ModalEthereum
}

/**
 * Component
 */
export function Web3Modal({ ethereumClient, ...config }: Props) {
  const onConfigure = useCallback(async () => {
    ConfigCtrl.setConfig(config)
    if (ethereumClient) ClientCtrl.setEthereumClient(ethereumClient)
    await import('@web3modal/ui')
  }, [ethereumClient, config])

  useEffect(() => {
    onConfigure()
  }, [onConfigure])

  return <Modal />
}
