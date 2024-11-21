import { html } from 'lit'
import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-list-select-account'
import '../../components/gallery-container'
import type { WuiListSelectAccount } from '@reown/appkit-ui-new'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiListSelectAccount>

export default {
  title: 'Composites/wui-list-select-account',
  args: {
    amount: 1740.72,
    currency: 'USD',
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    description: 'Email',
    icon: 'mail',
    disabled: false
  },
  argTypes: {
    amount: {
      control: { type: 'number' }
    },
    currency: {
      options: ['USD', 'EUR', 'GBP'],
      control: { type: 'select' }
    },
    address: {
      control: { type: 'text' }
    },
    description: {
      control: { type: 'text' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="328">
      <wui-list-select-account
        amount=${args.amount}
        currency=${args.currency}
        address=${args.address}
        description=${args.description}
        icon=${args.icon}
        ?disabled=${args.disabled}
      ></wui-list-select-account>
    </gallery-container>
  `
}
