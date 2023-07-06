import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-icon-box'
import type { WuiIconBox } from '@web3modal/ui/src/composites/wui-icon-box'
import { html } from 'lit'

import { colorOptions, iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiIconBox>

export default {
  title: 'Composites/wui-icon-box',
  args: {
    size: 'md',
    backgroundColor: 'blue-100',
    iconColor: 'blue-100',
    icon: 'copy'
  },

  argTypes: {
    size: {
      defaultValue: 'md',
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    backgroundColor: {
      options: colorOptions,
      control: { type: 'select' }
    },
    iconColor: {
      options: colorOptions,
      control: { type: 'select' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-icon-box
      size=${args.size}
      iconColor=${args.iconColor}
      backgroundColor=${args.backgroundColor}
      icon=${args.icon}
    ></wui-icon-box>`
}
