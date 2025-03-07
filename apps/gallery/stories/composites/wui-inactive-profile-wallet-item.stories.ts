import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-inactive-profile-wallet-item'
import type { WuiInactiveProfileWalletItem } from '@reown/appkit-ui/wui-inactive-profile-wallet-item'

import '../../components/gallery-container'
import {
  address,
  buttonOptions,
  currencyOptions,
  walletImagesOptions
} from '../../utils/PresetUtils'

type Component = Meta<WuiInactiveProfileWalletItem>

export default {
  title: 'Composites/wui-inactive-profile-wallet-item',
  args: {
    address,
    profileName: '',
    alt: 'MetaMask',
    amount: 102.45,
    currency: 'USD',
    buttonLabel: 'Switch',
    buttonVariant: 'accent',
    loading: false,
    imageSrc: walletImagesOptions[0]?.src,
    totalNetworks: 2,
    showBalance: true,
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
    amount: {
      control: { type: 'number' }
    },
    currency: {
      options: currencyOptions,
      control: { type: 'select' }
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
    totalNetworks: {
      control: { type: 'number' }
    },
    loading: {
      control: { type: 'boolean' }
    },
    showBalance: {
      control: { type: 'boolean' }
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
      <wui-inactive-profile-wallet-item
        address=${args.address}
        profileName=${args.profileName}
        alt=${args.alt}
        amount=${args.amount}
        currency=${args.currency}
        buttonLabel=${args.buttonLabel}
        buttonVariant=${args.buttonVariant}
        imageSrc=${args.imageSrc}
        totalNetworks=${args.totalNetworks}
        .charsStart=${args.charsStart}
        .charsEnd=${args.charsEnd}
        ?loading=${args.loading}
        ?showBalance=${args.showBalance}
      ></wui-inactive-profile-wallet-item>
    </gallery-container>
  `
}
