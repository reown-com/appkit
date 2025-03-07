import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-icon-link'
import type { WuiIconLink } from '@reown/appkit-ui/wui-icon-link'

import { colorOptions, iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiIconLink>

export default {
  title: 'Composites/wui-icon-link',
  args: {
    size: 'md',
    disabled: false,
    icon: 'copy',
    iconColor: 'inherit'
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    iconColor: {
      options: colorOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-icon-link
      ?disabled=${args.disabled}
      size=${args.size}
      icon=${args.icon}
      iconColor=${args.iconColor}
    ></wui-icon-link>`
}
