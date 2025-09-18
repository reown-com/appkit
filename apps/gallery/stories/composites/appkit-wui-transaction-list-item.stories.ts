import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-transaction-list-item'
import type { WuiTransactionListItem } from '@reown/appkit-ui/wui-transaction-list-item'

import '../../components/gallery-container'
import { walletImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiTransactionListItem>

export default {
  title: 'Composites/apkt-transaction-list-item',
  args: {
    type: 'approve',
    descriptions: ['1 ETH', '3245 USDC'],
    date: '2021-01-01',
    onlyDirectionIcon: false,
    status: 'confirmed',
    direction: 'in',
    images: [
      {
        type: 'NFT',
        url: walletImageSrc
      }
    ]
  },
  argTypes: {
    type: {
      control: 'select',
      options: [
        'approve',
        'bought',
        'borrow',
        'burn',
        'cancel',
        'claim',
        'deploy',
        'deposit',
        'execute',
        'mint',
        'receive',
        'repay',
        'send',
        'stake',
        'trade',
        'unstake',
        'withdraw'
      ]
    },
    status: {
      control: 'select',
      options: ['confirmed', 'failed', 'pending']
    },
    direction: {
      control: 'select',
      options: ['in', 'out', 'self']
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="400">
      <wui-transaction-list-item
        .type=${args.type}
        .status=${args.status}
        .direction=${args.direction}
        .descriptions=${args.descriptions}
        .date=${args.date}
        .onlyDirectionIcon=${args.onlyDirectionIcon}
      ></wui-transaction-list-item>
    </gallery-container>`
}
