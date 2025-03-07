import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-shimmer'
import type { WuiShimmer } from '@reown/appkit-ui/wui-shimmer'

import { borderRadiusOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiShimmer>

export default {
  title: 'Components/wui-shimmer',
  args: {
    width: '200px',
    height: '50px',
    borderRadius: 's'
  },
  argTypes: {
    borderRadius: {
      options: borderRadiusOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-shimmer
      width=${args.width}
      height="${args.height}"
      borderRadius=${args.borderRadius}
    ></wui-shimmer>`
}
