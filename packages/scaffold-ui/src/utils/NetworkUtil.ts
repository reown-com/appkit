import { OptionsController, RouterUtil } from '@web3modal/core'

export const NetworkUtil = {
  onNetworkChange: async () => {
    if (OptionsController.state.isSiweEnabled) {
      const { SIWEController } = await import('@web3modal/siwe')
      if (SIWEController.state._client?.options?.signOutOnNetworkChange) {
        await SIWEController.signOut()
      } else {
        RouterUtil.navigateAfterNetworkSwitch()
      }
    } else {
      RouterUtil.navigateAfterNetworkSwitch()
    }
  }
}
