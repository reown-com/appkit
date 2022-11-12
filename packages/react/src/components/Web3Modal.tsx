import type { ConfigOptions } from '@web3modal/core'
import { ClientCtrl, ConfigCtrl } from '@web3modal/core'
import type { Web3ModalEthereum } from '@web3modal/ethereum'
import React, { useCallback, useEffect } from 'react'
import { Modal } from './Modal'

/**
 * Props
 */
interface Props {
  config: ConfigOptions
  ethereumClient?: typeof Web3ModalEthereum
}

/**
 * Component
 */
export function Web3Modal({ config, ethereumClient }: Props) {
  const onConfigure = useCallback(async () => {
    ConfigCtrl.setConfig(config)
    if (ethereumClient) ClientCtrl.setEthereumClient(ethereumClient)
    await import('@web3modal/ui')
  }, [config, ethereumClient])

  useEffect(() => {
    onConfigure()
  }, [onConfigure])

  return <Modal />
}
