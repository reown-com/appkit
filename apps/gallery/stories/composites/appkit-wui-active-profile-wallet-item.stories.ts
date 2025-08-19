import type { Meta } from '@storybook/web-components'

import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

import '@reown/appkit-ui/wui-active-profile-wallet-item'
import type { WuiActiveProfileWalletItem } from '@reown/appkit-ui/wui-active-profile-wallet-item'

import { iconOptions, walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiActiveProfileWalletItem>

export default {
  title: 'Composites/appkit-wui-active-profile-wallet-item',
  args: {
    address: '0x1234567890123456789012345678901234567890',
    profileName: 'enesozturk.eth',
    content: [
      {
        address: '0x1234567890123456789012345678901234567890',
        profileName: 'enesozturk.eth',
        description: 'EOA',
        tagLabel: 'Active',
        tagVariant: 'success',
        enableButton: true,
        buttonType: 'disconnect',
        buttonLabel: 'Disconnect',
        buttonVariant: 'neutral-secondary'
      },
      {
        address: '0x1234567890123456789012345678901234567890',
        profileName: 'enesozturk.wcn.id',
        description: 'Smart Account',
        enableButton: true,
        buttonType: 'switch',
        buttonLabel: 'Switch',
        buttonVariant: 'accent-secondary'
      }
    ],
    imageSrc: walletImagesOptions[0]?.src,
    icon: 'user',
    iconSize: 'md',
    iconBadge: undefined,
    iconBadgeSize: 'md',
    buttonVariant: 'neutral-primary',
    enableMoreButton: true,
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
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-active-profile-wallet-item
      style="width: 320px;"
      .address=${args.address}
      .profileName=${args.profileName}
      .content=${args.content}
      .imageSrc=${args.imageSrc}
      .icon=${args.icon}
      .iconSize=${args.iconSize}
      .iconBadge=${args.iconBadge}
      .iconBadgeSize=${args.iconBadgeSize}
      .enableMoreButton=${args.enableMoreButton}
    ></wui-active-profile-wallet-item>`
}

export const WithImage: Component = {
  render: args =>
    html`<wui-active-profile-wallet-item
      style="width: 320px;"
      .address=${args.address}
      .profileName=${args.profileName}
      .content=${args.content}
      .imageSrc=${ifDefined(walletImagesOptions[1]?.src)}
      .icon=${undefined}
      .iconSize=${args.iconSize}
      .iconBadge=${args.iconBadge}
      .iconBadgeSize=${args.iconBadgeSize}
      .enableMoreButton=${args.enableMoreButton}
    ></wui-active-profile-wallet-item>`
}

export const WithSocials: Component = {
  render: args =>
    html`<wui-active-profile-wallet-item
      style="width: 320px;"
      .address=${args.address}
      .profileName=${args.profileName}
      .content=${args.content}
      .imageSrc=${args.imageSrc}
      .icon=${'google'}
      .iconSize=${args.iconSize}
      .iconBadge=${args.iconBadge}
      .iconBadgeSize=${args.iconBadgeSize}
      .enableMoreButton=${args.enableMoreButton}
    ></wui-active-profile-wallet-item>`
}

export const WithoutMoreButton: Component = {
  render: args =>
    html`<wui-active-profile-wallet-item
      style="width: 320px;"
      .address=${args.address}
      .profileName=${args.profileName}
      .content=${args.content}
      .imageSrc=${args.imageSrc}
      .icon=${'google'}
      .iconSize=${args.iconSize}
      .iconBadge=${args.iconBadge}
      .iconBadgeSize=${args.iconBadgeSize}
      .enableMoreButton=${false}
    ></wui-active-profile-wallet-item>`
}
