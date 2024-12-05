import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui/src/composites/wui-wallet-button'
import { html } from 'lit'
import { walletImageSrc } from '../../utils/PresetUtils'
import type { WuiWalletButton } from '@reown/appkit-ui/dist/types/src/composites/wui-wallet-button'

type Component = Meta<WuiWalletButton>

export default {
  title: 'Composites/wui-wallet-button',
  args: {
    imageSrc: walletImageSrc,
    name: 'Rainbow',
    size: 'md',
    loading: false,
    error: false,
    disabled: false
  },
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    name: {
      control: { type: 'text' }
    },
    loading: {
      control: { type: 'boolean' }
    },
    error: {
      control: { type: 'boolean' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    size: {
      options: ['md', 'lg'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-wallet-button
      .imageSrc=${args.imageSrc}
      name=${args.name}
      size=${args.size}
      ?loading=${args.loading}
      ?error=${args.error}
      ?disabled=${args.disabled}
    ></wui-wallet-button>`
}
