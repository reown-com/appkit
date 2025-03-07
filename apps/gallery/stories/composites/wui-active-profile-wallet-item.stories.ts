/* eslint-disable no-alert */
import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-active-profile-wallet-item'
import type { WuiActiveProfileWalletItem } from '@reown/appkit-ui/wui-active-profile-wallet-item'

import '../../components/gallery-container'
import { address, currencyOptions, walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiActiveProfileWalletItem>

const tagOptions = ['main', 'shade', 'error', 'success'] as const

export default {
  title: 'Composites/wui-active-profile-wallet-item',
  args: {
    address,
    profileName: '',
    alt: 'MetaMask',
    amount: 102.45,
    currency: 'USD',
    imageSrc: walletImagesOptions[0]?.src,
    totalNetworks: 2,
    charsStart: 4,
    charsEnd: 6,
    tagLabel: 'Active',
    tagVariant: 'success'
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
    amount: {
      control: { type: 'number' }
    },
    currency: {
      options: currencyOptions,
      control: { type: 'select' }
    },
    imageSrc: {
      control: { type: 'text' }
    },
    totalNetworks: {
      control: { type: 'number' }
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
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="336">
      <wui-active-profile-wallet-item
        address=${args.address}
        profileName=${args.profileName}
        alt=${args.alt}
        amount=${args.amount}
        currency=${args.currency}
        imageSrc=${args.imageSrc}
        totalNetworks=${args.totalNetworks}
        tagLabel=${args.tagLabel}
        tagVariant=${args.tagVariant}
        .charsStart=${args.charsStart}
        .charsEnd=${args.charsEnd}
        @disconnect=${() => alert('disconnect')}
        @copy=${() => alert('copied')}
      ></wui-active-profile-wallet-item>
    </gallery-container>
  `
}
