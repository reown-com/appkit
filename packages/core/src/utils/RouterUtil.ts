import { RouterController } from '../controllers/RouterController.js'
import { ModalController } from '../controllers/ModalController.js'

export const RouterUtil = {
  goBackOrCloseModal() {
    if (RouterController.state.history.length > 1) {
      RouterController.goBack()
    } else {
      ModalController.close()
    }
  },
  navigateAfterNetworkSwitch() {
    const { history } = RouterController.state
    const networkSelectIndex = history.findIndex(name => name === 'Networks')
    const pageBeforeNetworkSelect = history[networkSelectIndex - 1]
    if (pageBeforeNetworkSelect) {
      RouterController.replace(pageBeforeNetworkSelect)
    } else {
      ModalController.close()
    }
  }
}
