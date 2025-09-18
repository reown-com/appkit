import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-icon'
import type { WuiIcon } from '@reown/appkit-ui/wui-icon'

import { colorOptions, iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiIcon>

export default {
  title: 'Components/appkit-wui-icon',
  args: {
    size: 'md',
    name: 'copy',
    color: 'default',
    weight: 'bold'
  },
  argTypes: {
    size: {
      options: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      control: { type: 'select' }
    },
    name: {
      options: iconOptions,
      control: { type: 'select' }
    },
    color: {
      options: colorOptions,
      control: { type: 'select' }
    },
    weight: {
      options: ['regular', 'bold', 'fill'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-icon
      color=${args.color}
      size=${args.size}
      name=${args.name}
      weight=${args.weight}
    ></wui-icon>`
}
