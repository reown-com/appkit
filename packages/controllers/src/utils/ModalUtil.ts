import { ConnectionController } from '../controllers/ConnectionController.js'
import { ModalController } from '../controllers/ModalController.js'
import { RouterController } from '../controllers/RouterController.js'
import { SIWXUtil } from './SIWXUtil.js'

export const ModalUtil = {
  isUnsupportedChainView(): boolean {
    return (
      RouterController.state.view === 'UnsupportedChain' ||
      (RouterController.state.view === 'SwitchNetwork' &&
        RouterController.state.history.includes('UnsupportedChain'))
    )
  },

  async safeClose() {
    if (this.isUnsupportedChainView()) {
      ModalController.shake()

      return
    }

    const isSIWXCloseDisabled = await SIWXUtil.isSIWXCloseDisabled()
    if (isSIWXCloseDisabled) {
      ModalController.shake()

      return
    }

    if (
      RouterController.state.view === 'DataCapture' ||
      RouterController.state.view === 'DataCaptureOtpConfirm'
    ) {
      ConnectionController.disconnect()
    }

    ModalController.close()
  }
}
