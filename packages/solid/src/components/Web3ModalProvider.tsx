import type { ConfigOptions } from '@web3modal/core'
import { ClientCtrl, ConfigCtrl } from '@web3modal/core'
import type { JSX } from 'solid-js'
import { createEffect } from 'solid-js'
import { Web3Modal as Modal } from './Web3Modal'

/**
 * Props
 */
interface Props {
  children: JSX.Element | JSX.Element[]
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
