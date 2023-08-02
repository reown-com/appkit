import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-list-wallet'
import type { WuiListWallet } from '@web3modal/ui/src/composites/wui-list-wallet'
import { html } from 'lit'
import '../../components/gallery-container.js'
import { tagOptions, walletImagesOptions } from '../../utils/PresetUtils.js'

type Component = Meta<WuiListWallet>

export default {
  title: 'Composites/wui-list-wallet',
  args: {
    walletImages: walletImagesOptions,
    imageSrc: walletImagesOptions[0]?.src,
    name: 'Rainbow',
    showAllWallets: false,
    disabled: false,
    tagLabel: 'qr code',
    tagVariant: 'main'
  },
  argTypes: {
    showAllWallets: {
      control: { type: 'boolean' }
    },
    tagVariant: {
      options: [undefined, ...tagOptions],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-wallet
        .imageSrc=${args.imageSrc}
        .walletImages=${args.walletImages}
        .showAllWallets=${args.showAllWallets}
        .tagLabel=${args.tagLabel}
        .tagVariant=${args.tagVariant}
        ?disabled=${args.disabled}
        name=${args.name}
      ></wui-list-wallet>
    </gallery-container>`
}
