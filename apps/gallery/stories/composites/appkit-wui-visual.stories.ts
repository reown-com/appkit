import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-visual'
import type { WuiVisual } from '@reown/appkit-ui/wui-visual'

import { visualOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiVisual>

export default {
  title: 'Composites/apkt-visual',
  args: {
    name: 'browser'
  },
  argTypes: {
    name: {
      options: visualOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-visual name=${args.name}></wui-visual>`
}
