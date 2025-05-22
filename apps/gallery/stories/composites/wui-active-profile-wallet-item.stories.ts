/* eslint-disable no-alert */
import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-active-profile-wallet-item'
import type { WuiActiveProfileWalletItem } from '@reown/appkit-ui/wui-active-profile-wallet-item'

import '../../components/gallery-container'
import { address, buttonOptions, iconOptions, walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiActiveProfileWalletItem>

export default {
  title: 'Composites/wui-active-profile-wallet-item',
  args: {
    alt: 'MetaMask',
    imageSrc: walletImagesOptions[0]?.src,
    charsStart: 4,
    charsEnd: 6,
    buttonVariant: 'neutral',
    icon: undefined,
    iconBadge: undefined,
    iconBadgeSize: 'md',
    iconSize: 'md',
    confirmation: false,
    enableMoreButton: true,
    content: [
      {
        address,
        profileName: 'vitalik.eth',
        label: 'EOA Account',
        tagLabel: 'Active',
        tagVariant: 'success',
        enableButton: false
      },
      {
        address,
        profileName: undefined,
        label: 'Smart Account',
        tagVariant: 'success',
        enableButton: true
      }
    ]
  },
  argTypes: {
    content: {
      control: { type: 'object' }
    },
    alt: {
      control: { type: 'text' }
    },
    imageSrc: {
      control: { type: 'text' }
    },
    charsStart: {
      control: { type: 'number' }
    },
    charsEnd: {
      control: { type: 'number' }
    },
    enableMoreButton: {
      control: { type: 'boolean' }
    },
    buttonVariant: {
      options: buttonOptions,
      control: { type: 'select' }
    },
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    iconBadge: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    iconSize: {
      options: ['xl', 'md', 'sm', 'xs'],
      control: { type: 'select' }
    },
    iconBadgeSize: {
      options: ['xl', 'md', 'sm', 'xs'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="336">
      <wui-active-profile-wallet-item
        alt=${args.alt}
        imageSrc=${args.imageSrc}
        icon=${args.icon}
        iconBadge=${args.iconBadge}
        iconSize=${args.iconSize}
        iconBadgeSize=${args.iconBadgeSize}
        charsStart=${args.charsStart}
        charsEnd=${args.charsEnd}
        .content=${args.content}
        ?enableMoreButton=${args.enableMoreButton}
        @disconnect=${() => alert('disconnect')}
        @copy=${() => alert('copied')}
      ></wui-active-profile-wallet-item>
    </gallery-container>
  `
}
