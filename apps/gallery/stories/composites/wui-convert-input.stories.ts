import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-list-item'
import type { WuiConvertInput } from '@web3modal/ui/src/composites/wui-convert-input'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiConvertInput>

export default {
  title: 'Composites/wui-convert-input',
  args: {
    value: '',
    disabled: false,
    target: 'sourceToken', // or 'toToken
    balance: '11.43',
    token: undefined,
    price: 1.2,
    marketValue: '13.72'
  },
  argTypes: {
    value: {
      control: { type: 'text' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    target: {
      options: ['sourceToken', 'toToken'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="336">
      <wui-convert-input
        value=${args.value}
        .disabled=${args.disabled}
        @setAmount=${args.onSetAmount}
        target=${args.target}
        balance=${args.balance}
        .token=${args.token}
        price=${args.price}
        marketValue=${args.marketValue}
      >
      </wui-convert-input
    </gallery-container>`
}
