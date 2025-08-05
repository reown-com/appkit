import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-token-list-item-loader'
import type { WuiTokenListItemLoader } from '@reown/appkit-ui/wui-token-list-item-loader'

import '../../components/gallery-container'

type Component = Meta<WuiTokenListItemLoader>

export default {
  title: 'Composites/wui-token-list-item-loader'
} as Component

export const Default: Component = {
  render: () =>
    html` <gallery-container width="336">
      <wui-token-list-item-loader></wui-token-list-item-loader>
    </gallery-container>`
}
