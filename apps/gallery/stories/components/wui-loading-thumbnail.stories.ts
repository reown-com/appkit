import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-loading-thumbnail'
import type { WuiLoadingThumbnail } from '@reown/appkit-ui/wui-loading-thumbnail'

type Component = Meta<WuiLoadingThumbnail>

export default {
  title: 'Components/wui-loading-thumbnail',
  args: {
    radius: 36
  }
} as Component

export const Default: Component = {
  render: args => html` <wui-loading-thumbnail radius=${args.radius}></wui-loading-thumbnail>`
}
