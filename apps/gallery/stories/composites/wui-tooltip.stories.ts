import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-tooltip'
import type { WuiTooltip } from '@reown/appkit-ui/wui-tooltip'

import { placementOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiTooltip>

export default {
  title: 'Composites/wui-tooltip',
  args: {
    message: 'Tooltip',
    placement: 'top',
    variant: 'fill'
  },

  argTypes: {
    placement: {
      options: placementOptions,
      control: { type: 'select' }
    },
    variant: {
      options: ['fill', 'shade'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-tooltip
      variant=${args.variant}
      placement=${args.placement}
      message=${args.message}
    ></wui-tooltip>`
}
