import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@laughingwhales/appkit-ui/wui-loading-hexagon'
import type { WuiLoadingHexagon } from '@laughingwhales/appkit-ui/wui-loading-hexagon'

type Component = Meta<WuiLoadingHexagon>

export default {
  title: 'Composites/appkit-wui-loading-hexagon'
} as Component

export const Default: Component = {
  render: () => html` <wui-loading-hexagon></wui-loading-hexagon>`
}
