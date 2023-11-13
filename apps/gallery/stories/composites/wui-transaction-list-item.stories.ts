import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-transaction-list-item'
import type { WuiTransactionListItem } from '@web3modal/ui/src/composites/wui-transaction-list-item'
import { html } from 'lit'
import '../../components/gallery-container'
import {
  transactionDirectionOptions,
  transactionImageSrc,
  transactionStatusOptions,
  transactionTypeOptions
} from '../../utils/PresetUtils'

type Component = Meta<WuiTransactionListItem>

export default {
  title: 'Composites/wui-transaction-list-item',
  args: {
    type: 'approve',
    images: [
      {
        type: 'NFT',
        url: transactionImageSrc
      }
    ],
    status: 'confirmed',
    direction: 'in',
    descriptions: ['+8 SOCKS']
  },
  argTypes: {
    type: {
      options: transactionTypeOptions,
      control: { type: 'select' }
    },
    images: {
      control: { type: 'array' }
    },
    status: {
      options: transactionStatusOptions,
      control: { type: 'select' }
    },
    direction: {
      options: transactionDirectionOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-transaction-list-item
        type=${args.type}
        status=${args.status}
        direction=${args.direction}
        .images=${args.images}
        .descriptions=${args.descriptions}
      ></wui-transaction-list-item>
    </gallery-container>`
}
