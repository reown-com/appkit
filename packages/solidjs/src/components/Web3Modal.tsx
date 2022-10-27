import type { ConfigOptions } from '@web3modal/core'
import { ClientCtrl, ConfigCtrl } from '@web3modal/core'
import { createEffect } from 'solid-js'
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
export function Web3Modal(props: Props) {
  async function onConfigure() {
    ConfigCtrl.setConfig(props.config)
    if (props.config.ethereum) await ClientCtrl.setEthereumClient(props.config.ethereum)
    await import('@web3modal/ui')
  }

  createEffect(() => {
    onConfigure()
  })

  return <Modal />
}
