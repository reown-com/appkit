import { ModalController } from '@web3modal/core'
import { RouterController } from '@web3modal/core'

export const goBackOrCloseModal = () => {
  if (RouterController.state.history.length > 1) {
    RouterController.goBack()
  } else {
    ModalController.close()
  }
}
