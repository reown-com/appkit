import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-wallet-switch'
import type { WuiWalletSwitch } from '@reown/appkit-ui/wui-wallet-switch'

import { iconOptions, walletImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiWalletSwitch>

export default {
  title: 'Composites/appkit-wallet-switch',
  args: {
    address: '0x1234567890123456789012345678901234567890',
    profileName: 'John Doe',
    alt: 'MetaMask',
    imageSrc: walletImageSrc,
    icon: 'qrCode',
    loading: false
  },
  argTypes: {
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-wallet-switch
      .address=${args.address}
      .profileName=${args.profileName}
      .alt=${args.alt}
      .imageSrc=${args.imageSrc}
      .icon=${args.icon}
      .iconSize=${args.iconSize}
      .loading=${args.loading}
    ></wui-wallet-switch>`
}
