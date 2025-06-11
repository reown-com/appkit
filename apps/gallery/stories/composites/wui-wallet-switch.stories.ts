/* eslint-disable no-alert */
import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-wallet-switch'
import type { WuiWalletSwitch } from '@reown/appkit-ui/wui-wallet-switch'

import '../../components/gallery-container'
import { address, iconOptions, walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiWalletSwitch>

export default {
  title: 'Composites/wui-wallet-switch',
  args: {
    address,
    profileName: '',
    alt: 'MetaMask',
    imageSrc: walletImagesOptions[0]?.src,
    icon: undefined,
    iconSize: 'md',
    loading: false,
    charsStart: 4,
    charsEnd: 6
  },
  argTypes: {
    address: { control: 'text' },
    profileName: { control: 'text' },
    alt: { control: 'text' },
    imageSrc: { control: 'text' },
    icon: {
      options: [undefined, ...iconOptions],
      control: 'select'
    },
    iconSize: {
      options: ['xl', 'md', 'sm', 'xs'],
      control: 'select'
    },
    loading: { control: 'boolean' },
    charsStart: { control: 'number' },
    charsEnd: { control: 'number' }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="170">
      <wui-wallet-switch
        address=${args.address}
        profileName=${args.profileName}
        alt=${args.alt}
        imageSrc=${args.imageSrc}
        icon=${args.icon}
        iconSize=${args.iconSize}
        charsStart=${args.charsStart}
        charsEnd=${args.charsEnd}
      ></wui-wallet-switch>
    </gallery-container>
  `
}
