import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-icon'
import type { WuiIcon } from '@reown/appkit-ui/wui-icon'

import { colorOptions, iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiIcon>

export default {
  title: 'Components/wui-icon',
  args: {
    size: 'md',
    color: 'fg-100',
    name: 'copy'
  },
  argTypes: {
    size: {
      options: ['xxs', 'xs', 'sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    color: {
      options: colorOptions,
      control: { type: 'select' }
    },
    name: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-icon size=${args.size} color=${args.color} name=${args.name}></wui-icon>`
}
