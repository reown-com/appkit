import type { ConfigOptions } from '@web3modal/core'
import { subscribeTheme } from '@web3modal/ui'
import { ClientCtrl, ConfigCtrl } from '@web3modal/core'
import React, { useCallback, useEffect } from 'react'
import { Modal } from './Modal'

/**
 * Props
 */
interface Props {
  config: ConfigOptions
}

/**
 * Component
 */
export function Web3Modal({ config }: Props) {
  const onConfigure = useCallback(async () => {
    ConfigCtrl.setConfig(config)
    if (config.ethereum) await ClientCtrl.setEthereumClient(config.ethereum)
    const ui = await import('@web3modal/ui')
    const unsubTheme = ui.subscribeTheme()

    return () => {
      unsubTheme()
    }
  }, [config])

  useEffect(() => {
    onConfigure()
  }, [onConfigure])

  return <Modal />
}
