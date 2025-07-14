import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-transaction-list-item-loader'
import type { WuiTransactionListItemLoader } from '@reown/appkit-ui/wui-transaction-list-item-loader'

import '../../components/gallery-container'

type Component = Meta<WuiTransactionListItemLoader>

export default {
  title: 'Composites/wui-transaction-list-item-loader'
} as Component

export const Default: Component = {
  render: () =>
    html` <gallery-container width="336">
      <wui-transaction-list-item-loader></wui-transaction-list-item-loader>
    </gallery-container>`
}
