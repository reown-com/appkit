import { ConstantsUtil } from '@rerock/common'
import { ChainController, OptionsController, RouterUtil } from '@rerock/core'

export const NetworkUtil = {
  onNetworkChange: async () => {
    const isEIP155Namespace = ChainController.state.activeChain === ConstantsUtil.CHAIN.EVM

    if (OptionsController.state.isSiweEnabled) {
      const { SIWEController } = await import('@rerock/siwe')
      const shouldNotNavigate =
        SIWEController.state._client?.options?.signOutOnNetworkChange && isEIP155Namespace

      if (!shouldNotNavigate) {
        RouterUtil.navigateAfterNetworkSwitch()
      }
    } else {
      RouterUtil.navigateAfterNetworkSwitch()
    }
  }
}
