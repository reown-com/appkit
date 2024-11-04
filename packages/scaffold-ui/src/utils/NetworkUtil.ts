import { RouterUtil } from '@reown/appkit-core'

export const NetworkUtil = {
  onNetworkChange: async () => {
    RouterUtil.navigateAfterNetworkSwitch()

    return Promise.resolve()
  }
}
