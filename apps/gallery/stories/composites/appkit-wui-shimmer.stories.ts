import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-shimmer'
import type { WuiShimmer } from '@reown/appkit-ui/wui-shimmer'

type Component = Meta<WuiShimmer>

export default {
  title: 'Composites/apkt-shimmer',
  args: {
    width: '200px',
    height: '50px',
    rounded: false
  },
  argTypes: {}
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-shimmer
      width=${args.width}
      height="${args.height}"
      ?rounded=${args.rounded}
    ></wui-shimmer>`
}
