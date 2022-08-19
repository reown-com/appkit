import * as wagmi from '@wagmi/core'

const Web3ModalEthereum = {
  wagmi
}

export default Web3ModalEthereum

/**
 * Expose global api for vanilla js
 */
window.Web3Modal.ethereum = Web3ModalEthereum

declare global {
  interface Window {
    Web3Modal: {
      ethereum: typeof Web3ModalEthereum
    }
  }
}
