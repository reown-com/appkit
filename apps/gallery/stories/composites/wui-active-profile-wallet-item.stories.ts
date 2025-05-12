/* eslint-disable no-alert */
import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-active-profile-wallet-item'
import type { WuiActiveProfileWalletItem } from '@reown/appkit-ui/wui-active-profile-wallet-item'

import '../../components/gallery-container'
import { address, buttonOptions, iconOptions, walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiActiveProfileWalletItem>

const tagOptions = ['main', 'shade', 'error', 'success'] as const

export default {
  title: 'Composites/wui-active-profile-wallet-item',
  args: {
    address,
    domainName: '',
    description: '',
    alt: 'MetaMask',
    imageSrc: walletImagesOptions[0]?.src,
    charsStart: 4,
    charsEnd: 6,
    tagLabel: 'Active',
    tagVariant: 'success',
    buttonVariant: 'neutral',
    icon: undefined,
    loading: false,
    iconSize: 'md'
  },
  argTypes: {
    address: {
      control: { type: 'text' }
    },
    domainName: {
      control: { type: 'text' }
    },
    description: {
      control: { type: 'text' }
    },
    alt: {
      control: { type: 'text' }
    },
    imageSrc: {
      control: { type: 'text' }
    },
    tagLabel: {
      control: { type: 'text' }
    },
    tagVariant: {
      options: tagOptions,
      control: { type: 'select' }
    },
    charsStart: {
      control: { type: 'number' }
    },
    charsEnd: {
      control: { type: 'number' }
    },
    buttonVariant: {
      options: buttonOptions,
      control: { type: 'select' }
    },
    loading: {
      control: { type: 'boolean' }
    },
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    iconSize: {
      options: ['xl', 'md', 'sm', 'xs'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="336">
      <wui-active-profile-wallet-item
        address=${args.address}
        domainName=${args.domainName}
        description=${args.description}
        alt=${args.alt}
        imageSrc=${args.imageSrc}
        tagLabel=${args.tagLabel}
        tagVariant=${args.tagVariant}
        icon=${args.icon}
        iconSize=${args.iconSize}
        charsStart=${args.charsStart}
        charsEnd=${args.charsEnd}
        @disconnect=${() => alert('disconnect')}
        @copy=${() => alert('copied')}
      ></wui-active-profile-wallet-item>
    </gallery-container>
  `
}
