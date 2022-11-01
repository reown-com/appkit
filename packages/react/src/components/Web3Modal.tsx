import type { ConfigOptions } from '@web3modal/core'
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
    await ClientCtrl.setSolanaClient({
      projectId: config.projectId,
      metadata: {
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
        description: 'Demo Solib integration app',
        name: 'Solib Demo',
        url: window.location.origin
      }
    })
    if (config.ethereum) await ClientCtrl.setEthereumClient(config.ethereum)
    await import('@web3modal/ui')
  }, [config])

  useEffect(() => {
    onConfigure()
  }, [onConfigure])

  return <Modal />
}
