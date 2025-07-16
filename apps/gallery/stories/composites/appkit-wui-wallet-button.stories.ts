import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-wallet-button'
import type { WuiWalletButton } from '@reown/appkit-ui/wui-wallet-button'

import { iconOptions, walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiWalletButton>

export default {
  title: 'Composites/appkit-wui-wallet-button',
  component: 'wui-wallet-button',
  args: {
    name: 'Rainbow',
    imageSrc: walletImagesOptions[1]?.src,
    size: 'md',
    walletConnect: false,
    icon: 'wallet',
    loading: false,
    error: false,
    disabled: false
  },
  argTypes: {
    size: {
      options: ['lg', 'md', 'sm'],
      control: { type: 'select' }
    },
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <wui-wallet-button
      .imageSrc=${args.imageSrc}
      .name=${args.name}
      .size=${args.size}
      .walletConnect=${args.walletConnect}
      .icon=${args.icon}
      .loading=${args.loading}
      .error=${args.error}
      .disabled=${args.disabled}
    ></wui-wallet-button>`
}
