import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-transaction-thumbnail'
import type { WuiTransactionThumbnail } from '@reown/appkit-ui-new/src/composites/wui-transaction-thumbnail'
import { html } from 'lit'

import {
  transactionDirectionOptions,
  transactionTypeOptions,
  transactionStatusOptions,
  transactionImageSrc
} from '../../utils/PresetUtils'

type Component = Meta<WuiTransactionThumbnail>

export default {
  title: 'Composites/wui-transaction-thumbnail',
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
    html`<wui-transaction-thumbnail
      type=${args.type}
      images=${args.images}
      status=${args.status}
      direction=${args.direction}
    ></wui-transaction-thumbnail>`
}
