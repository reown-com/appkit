import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-inactive-profile-wallet-item'
import type { WuiInactiveProfileWalletItem } from '@reown/appkit-ui/wui-inactive-profile-wallet-item'

import { iconOptions, walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiInactiveProfileWalletItem>

export default {
  title: 'Composites/appkit-wui-inactive-profile-wallet-item',
  args: {
    address: '0x1234567890123456789012345678901234567890',
    profileName: 'enesozturk.eth',
    buttonLabel: 'Switch',
    buttonVariant: 'accent-secondary',
    imageSrc: walletImagesOptions[0]?.src,
    icon: 'user',
    iconSize: 'md',
    iconBadge: 'add',
    iconBadgeSize: 'md',
    rightIcon: 'power',
    loading: false,
    rightIconSize: 'md',
    charsStart: 4,
    charsEnd: 6
  },
  argTypes: {
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    iconSize: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    },
    iconBadge: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    iconBadgeSize: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    },
    rightIcon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    rightIconSize: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-inactive-profile-wallet-item
      style="width: 320px;"
      .address=${args.address}
      .profileName=${args.profileName}
      .buttonLabel=${args.buttonLabel}
      .buttonVariant=${args.buttonVariant}
      .imageSrc=${args.imageSrc}
      .icon=${args.icon}
      .iconSize=${args.iconSize}
      .iconBadge=${args.iconBadge}
      .iconBadgeSize=${args.iconBadgeSize}
      .rightIcon=${args.rightIcon}
      .rightIconSize=${args.rightIconSize}
      .loading=${args.loading}
      .charsStart=${args.charsStart}
      .charsEnd=${args.charsEnd}
    ></wui-inactive-profile-wallet-item>`
}

export const WithImage: Component = {
  render: args =>
    html`<wui-inactive-profile-wallet-item
      style="width: 320px;"
      .address=${args.address}
      .profileName=${args.profileName}
      .buttonLabel=${args.buttonLabel}
      .buttonVariant=${args.buttonVariant}
      .imageSrc=${args.imageSrc}
      .icon=${undefined}
      .iconSize=${args.iconSize}
      .iconBadge=${args.iconBadge}
      .iconBadgeSize=${args.iconBadgeSize}
      .rightIcon=${args.rightIcon}
      .rightIconSize=${args.rightIconSize}
      .loading=${args.loading}
      .charsStart=${args.charsStart}
      .charsEnd=${args.charsEnd}
    ></wui-inactive-profile-wallet-item>`
}
