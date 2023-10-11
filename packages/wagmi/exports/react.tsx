'use client'

import type {
  W3mAccountButton,
  W3mButton,
  W3mConnectButton,
  W3mNetworkButton
} from '@web3modal/scaffold'
import type { Web3ModalOptions } from '../src/client.js'
import { Web3Modal } from '../src/client.js'
import { VERSION } from '@web3modal/utils'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from '../src/client.js'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-connect-button': Pick<W3mConnectButton, 'size' | 'label' | 'loadingLabel'>
      'w3m-account-button': Pick<W3mAccountButton, 'disabled' | 'balance'>
      'w3m-button': Pick<W3mButton, 'size' | 'label' | 'loadingLabel' | 'disabled' | 'balance'>
      'w3m-network-button': Pick<W3mNetworkButton, 'disabled'>
    }
  }
}

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

export function createWeb3Modal(options: Web3ModalOptions) {
  if (!modal) {
    modal = new Web3Modal({ ...options, _sdkVersion: `react-wagmi-${VERSION}` })
  }

  return modal
}

// -- Hooks -------------------------------------------------------------------
export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents
} from '@web3modal/scaffold-react'

// -- Universal Exports -------------------------------------------------------
export { EIP6963Connector } from '../src/connectors/EIP6963Connector.js'
export { defaultWagmiConfig } from '../src/utils/defaultWagmiReactConfig.js'
