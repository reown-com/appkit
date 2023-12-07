import { RouterController } from '../controllers/RouterController.js'
import { ModalController } from '../controllers/ModalController.js'

export const RouterUtil = {
  goBackOrCloseModal() {
    console.log(RouterController.state.history.length)
    if (RouterController.state.history.length > 1) {
      RouterController.goBack()
    } else {
      ModalController.close()
    }
  }
}
