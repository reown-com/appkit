import { ModalController } from '../controllers/ModalController.js'
import { RouterController } from '../controllers/RouterController.js'
import { SIWXUtil } from './SIWXUtil.js'

export const ModalUtil = {
  async safeClose() {
    const isUnsupportedChain =
      RouterController.state.view === 'UnsupportedChain' ||
      (RouterController.state.view === 'SwitchNetwork' &&
        RouterController.state.history.includes('UnsupportedChain'))
    if (isUnsupportedChain || (await SIWXUtil.isSIWXCloseDisabled())) {
      ModalController.shake()
    } else {
      ModalController.close()
    }
  }
}
