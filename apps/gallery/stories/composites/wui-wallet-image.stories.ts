import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-wallet-image'
import type { WuiWalletImage } from '@web3modal/ui/src/composites/wui-wallet-image'
import { html } from 'lit'
import { walletImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiWalletImage>

export default {
  title: 'Composites/wui-wallet-image',
  args: {
    imageSrc: walletImageSrc,
    name: 'Rainbow',
    size: 'md'
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-wallet-image
      size=${args.size}
      .imageSrc=${args.imageSrc}
      alt=${args.name}
    ></wui-wallet-image>`
}
