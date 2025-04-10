import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/src/composites/wui-input-element'
import type { WuiInputElement } from '@reown/appkit-ui/src/composites/wui-input-element'

import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiInputElement>

export default {
  title: 'Composites/wui-input-element',
  args: {
    icon: 'close'
  },
  argTypes: {
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-input-element icon=${args.icon}></wui-input-element>`
}
