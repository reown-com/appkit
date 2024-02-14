import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-swap-input'
import type { WuiSwapInput } from '@web3modal/ui/src/composites/wui-swap-input'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiSwapInput>

const CURRENCIES = {
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
  },
  RAND: {
    name: 'Random Coin',
    symbol: 'RAND'
  }
}

export default {
  title: 'Composites/wui-swap-input',
  args: {
    disabled: false,
    currency: CURRENCIES.ETH,
    focused: false
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    },
    currency: {
      options: Object.keys(CURRENCIES),
      control: { type: 'select' },
      mapping: CURRENCIES
    },
    focused: {
      control: { type: 'boolean' }
    },
    value: {
      control: { type: 'number' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="336">
      <wui-swap-input
        ?disabled=${args.disabled}
        ?focused=${args.focused}
        .currency=${args.currency}
        .value=${args.value}
      ></wui-swap-input
    ></gallery-container>`
}
