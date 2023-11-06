import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-transaction-list-item'
import type { WuiTransactionListItem } from '@web3modal/ui/src/composites/wui-transaction-list-item'
import { html } from 'lit'
import '../../components/gallery-container'
import {
  transactionDirectionOptions,
  transactionStatusOptions,
  transactionTypeOptions
} from '../../utils/PresetUtils'

type Component = Meta<WuiTransactionListItem>

export default {
  title: 'Composites/wui-transaction-list-item',
  args: {
    type: 'approve',
    imageURL:
      'https://uploads-ssl.webflow.com/61fe6bb74158b468a1112105/61fe8900148b6e6ee7c2c4e4_Profile%20Pic_Smoker-p-500.jpeg',
    status: 'confirmed',
    direction: 'in',
    description: '+8 SOCKS',
    isNFT: false
  },
  argTypes: {
    type: {
      options: transactionTypeOptions,
      control: { type: 'select' }
    },
    isNFT: {
      control: { type: 'boolean' }
    },
    imageURL: {
      control: { type: 'text' }
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
        imageURL=${args.imageURL}
        .isNFT=${args.isNFT}
        status=${args.status}
        direction=${args.direction}
        description=${args.description}
      ></wui-transaction-list-item>
    </gallery-container>`
}
