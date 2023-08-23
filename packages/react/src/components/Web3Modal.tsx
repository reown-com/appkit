import type { ConfigCtrlState, ThemeCtrlState } from '@web3modal/core'
import { ClientCtrl, ConfigCtrl, OptionsCtrl, ThemeCtrl } from '@web3modal/core'
import type { EthereumClient } from '@web3modal/ethereum'
import React, { memo, useCallback, useEffect } from 'react'
import { Modal } from './Modal'

/**
 * Props
 */
export type Web3ModalProps = ConfigCtrlState &
  ThemeCtrlState & {
    ethereumClient?: EthereumClient
  }

/**
 * Component
 */
function CreateWeb3Modal({ ethereumClient, ...config }: Web3ModalProps) {
  const onConfigure = useCallback(async () => {
    ThemeCtrl.setThemeConfig(config)
    if (ethereumClient) {
      ClientCtrl.setEthereumClient(ethereumClient)
    }
    ConfigCtrl.setConfig(config)
    await import('@web3modal/ui')
    OptionsCtrl.setIsUiLoaded(true)
  }, [ethereumClient, config])

  useEffect(() => {
    onConfigure()
  }, [onConfigure])

  return <Modal />
}

export const Web3Modal = memo(CreateWeb3Modal)
