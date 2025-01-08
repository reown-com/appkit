import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-transaction-thumbnail'
import type { WuiTransactionThumbnail } from '@reown/appkit-ui-new/src/composites/wui-transaction-thumbnail'
import { html } from 'lit'

import { transactionThumbnailOptions, networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiTransactionThumbnail>

export default {
  title: 'Composites/wui-transaction-thumbnail',
  args: {
    type: 'approve',
    size: 'lg',
    images: [networkImageSrc],
    statusImageUrl: ''
  },
  argTypes: {
    type: {
      options: transactionThumbnailOptions,
      control: { type: 'select' }
    },
    size: {
      options: ['sm', 'lg'],
      control: { type: 'select' }
    },
    images: {
      control: { type: 'array' }
    },
    statusImageUrl: {
      control: { type: 'text' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-transaction-thumbnail
      type=${args.type}
      size=${args.size}
      statusImageUrl=${args.statusImageUrl}
      .images=${args.images}
    ></wui-transaction-thumbnail>`
}
