import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-inactive-profile-wallet-item'
import type { WuiInactiveProfileWalletItem } from '@reown/appkit-ui/wui-inactive-profile-wallet-item'

import '../../components/gallery-container'
import { address, buttonOptions, iconOptions, walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiInactiveProfileWalletItem>

export default {
  title: 'Composites/wui-inactive-profile-wallet-item',
  args: {
    address,
    profileName: '',
    alt: 'MetaMask',
    buttonLabel: 'Switch',
    buttonVariant: 'accent',
    loading: false,
    imageSrc: walletImagesOptions[0]?.src,
    icon: undefined,
    iconSize: 'md',
    rightIcon: undefined,
    rightIconSize: 'md',
    charsStart: 4,
    charsEnd: 6
  },
  argTypes: {
    address: {
      control: { type: 'text' }
    },
    profileName: {
      control: { type: 'text' }
    },
    alt: {
      control: { type: 'text' }
    },
    buttonLabel: {
      control: { type: 'text' }
    },
    buttonVariant: {
      options: buttonOptions,
      control: { type: 'select' }
    },
    imageSrc: {
      control: { type: 'text' }
    },
    loading: {
      control: { type: 'boolean' }
    },
    charsStart: {
      control: { type: 'number' }
    },
    charsEnd: {
      control: { type: 'number' }
    },
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    iconSize: {
      options: ['xl', 'md', 'sm', 'xs'],
      control: { type: 'select' }
    },
    rightIcon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    rightIconSize: {
      options: ['xl', 'md', 'sm', 'xs'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="336">
      <wui-inactive-profile-wallet-item
        address=${args.address}
        profileName=${args.profileName}
        alt=${args.alt}
        buttonLabel=${args.buttonLabel}
        buttonVariant=${args.buttonVariant}
        imageSrc=${args.imageSrc}
        .charsStart=${args.charsStart}
        .charsEnd=${args.charsEnd}
        .icon=${args.icon}
        .iconSize=${args.iconSize}
        .rightIcon=${args.rightIcon}
        .rightIconSize=${args.rightIconSize}
        ?loading=${args.loading}
      ></wui-inactive-profile-wallet-item>
    </gallery-container>
  `
}
