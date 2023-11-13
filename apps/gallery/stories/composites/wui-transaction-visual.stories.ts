import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-transaction-visual'
import type { WuiTransactionVisual } from '@web3modal/ui/src/composites/wui-transaction-visual'
import { html } from 'lit'

import {
  transactionDirectionOptions,
  transactionTypeOptions,
  transactionStatusOptions,
  transactionImageSrc
} from '../../utils/PresetUtils'

type Component = Meta<WuiTransactionVisual>

export default {
  title: 'Composites/wui-transaction-visual',
  args: {
    type: 'approve',
    imageURL: transactionImageSrc,
    status: 'confirmed',
    direction: 'in',
    images: [
      {
        type: 'NFT',
        url: transactionImageSrc
      }
    ]
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
    html`<wui-transaction-visual
      type=${args.type}
      images=${args.images}
      status=${args.status}
      direction=${args.direction}
    ></wui-transaction-visual>`
}
