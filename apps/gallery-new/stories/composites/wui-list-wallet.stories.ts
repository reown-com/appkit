import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-list-wallet'
import type { WuiListWallet } from '@reown/appkit-ui-new/src/composites/wui-list-wallet'
import { html } from 'lit'
import '../../components/gallery-container'
import { walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiListWallet>

export default {
  title: 'Composites/wui-list-wallet',
  args: {
    imageSrc: walletImagesOptions[0]?.src,
    name: 'MetaMask',
    tagLabel: 'LABEL',
    qrCode: false,
    allWallets: false,
    disabled: false
  },
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    name: {
      control: { type: 'text' }
    },
    tagLabel: {
      control: { type: 'text' }
    },
    qrCode: {
      control: { type: 'boolean' }
    },
    allWallets: {
      control: { type: 'boolean' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="328">
      <wui-list-wallet
        .imageSrc=${args.imageSrc}
        .tagLabel=${args.tagLabel}
        name=${args.name}
        ?qrcode=${args.qrCode}
        ?allwallets=${args.allWallets}
        ?disabled=${args.disabled}
      ></wui-list-wallet>
    </gallery-container>`
}
