import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import type { WuiWalletButton } from '@reown/appkit-ui/dist/types/src/composites/wui-wallet-button'
import '@reown/appkit-ui/wui-wallet-button'

import { iconOptions, walletImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiWalletButton>

export default {
  title: 'Composites/wui-wallet-button',
  args: {
    name: 'Rainbow',
    imageSrc: walletImageSrc,
    loading: false,
    error: false,
    icon: undefined,
    disabled: false
  },
  argTypes: {
    name: {
      control: { type: 'text' }
    },
    imageSrc: {
      control: { type: 'text' }
    },
    loading: {
      control: { type: 'boolean' }
    },
    error: {
      control: { type: 'boolean' }
    },
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
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
      .icon=${args.icon}
      name=${args.name}
      ?loading=${args.loading}
      ?error=${args.error}
      ?disabled=${args.disabled}
    ></wui-wallet-button>`
}
