import type { ConfigCtrlState, ThemeCtrlState } from '@web3modal/core'
import { ClientCtrl, ConfigCtrl, OptionsCtrl, ThemeCtrl } from '@web3modal/core'
import type { EthereumClient } from '@web3modal/ethereum'
import React, { useCallback, useEffect } from 'react'
import { Modal } from './Modal'

/**
 * Props
 */
type Props = Omit<
  ConfigCtrlState,
  'enableStandaloneMode' | 'standaloneChains' | 'walletConnectVersion'
> &
  ThemeCtrlState & {
    ethereumClient?: EthereumClient
  }

/**
 * Component
 */
function CreateWeb3Modal({ ethereumClient, ...config }: Props) {
  const onConfigure = useCallback(async () => {
    ThemeCtrl.setThemeConfig(config)
    if (ethereumClient) {
      ClientCtrl.setEthereumClient(ethereumClient)
    }
    ConfigCtrl.setConfig({ ...config, walletConnectVersion: ethereumClient?.walletConnectVersion })
    await import('@web3modal/ui')
    OptionsCtrl.setIsUiLoaded(true)
  }, [ethereumClient, config])

  useEffect(() => {
    onConfigure()
  }, [onConfigure])

  return <Modal />
}

export const Web3Modal = CreateWeb3Modal
