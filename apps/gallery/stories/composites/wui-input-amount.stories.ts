import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-input-amount'
import type { WuiInputAmount } from '@web3modal/ui/src/composites/wui-input-amount'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiInputAmount>

export default {
  title: 'Composites/wui-input-amount',
  args: {
    disabled: false,
    placeholder: '0'
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <wui-input-amount
      placeholder=${args.placeholder}
      ?disabled=${args.disabled}
    ></wui-input-amount>`
}
