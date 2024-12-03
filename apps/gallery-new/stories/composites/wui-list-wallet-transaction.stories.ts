import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-list-wallet-transaction'
import type { WuiListWalletTransaction } from '@reown/appkit-ui-new/src/composites/wui-list-wallet-transaction'
import { html } from 'lit'
import '../../components/gallery-container'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiListWalletTransaction>

export default {
  title: 'Composites/wui-list-wallet-transaction',
  args: {
    amount: '0.003',
    networkCurreny: 'ETH',
    networkImageUrl: networkImageSrc,
    receiverAddress: '0x3c8...7fab'
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-wallet-transaction
        amount=${args.amount}
        networkCurreny=${args.networkCurreny}
        networkImageUrl=${args.networkImageUrl}
        receiverAddress=${args.receiverAddress}
      ></wui-list-wallet-transaction>
    </gallery-container>`
}
