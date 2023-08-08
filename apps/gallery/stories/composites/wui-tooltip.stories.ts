import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-tooltip'
import type { WuiTooltip } from '@web3modal/ui/src/composites/wui-tooltip'
import { html } from 'lit'

import { placementOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiTooltip>

export default {
  title: 'Composites/wui-tooltip',
  args: {
    message: 'Tooltip',
    placement: 'top'
  },

  argTypes: {
    placement: {
      options: placementOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-tooltip placement=${args.placement} message=${args.message}></wui-tooltip>`
}
