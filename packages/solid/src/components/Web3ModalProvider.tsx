import type { ConfigOptions } from '@web3modal/core'
import { ClientCtrl, ConfigCtrl } from '@web3modal/core'
import type { ReactNode } from 'react'
import { createEffect } from 'solid-js'
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
export function Web3ModalProvider(props: Props) {
  async function onConfigure() {
    ConfigCtrl.setConfig(props.config)
    if (props.config.ethereum) await ClientCtrl.setEthereumClient(props.config.ethereum)
    await import('@web3modal/ui')
  }

  createEffect(() => {
    onConfigure()
  })

  return (
    <>
      {props.children}
      <Modal />
    </>
  )
}
