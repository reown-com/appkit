import { RouterController } from '../controllers/RouterController.js'
import { ModalController } from '../controllers/ModalController.js'
import { OptionsController } from '../controllers/OptionsController.js'
import { AccountController } from '../controllers/AccountController.js'
import { ChainController } from '../controllers/ChainController.js'

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
    if (networkSelectIndex >= 1) {
      RouterController.goBackToIndex(networkSelectIndex - 1)
    } else {
      ModalController.close()
    }
  },
  navigateAfterPreferredAccountTypeSelect() {
    const { isSiweEnabled } = OptionsController.state
    const profileName = AccountController.getProperty('profileName')
    if (isSiweEnabled && ChainController.state.activeChain === 'evm') {
      console.log(
        '>>> [RouterUtil] navigateAfterPreferredAccountTypeSelect: ConnectingSiwe',
        ChainController.state.activeChain
      )
      RouterController.push('ConnectingSiwe')
    } else {
      RouterController.push('Account')
    }
  }
}
