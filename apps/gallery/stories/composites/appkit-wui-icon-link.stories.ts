import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-icon-link'
import type { WuiIconLink } from '@reown/appkit-ui/wui-icon-link'

import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiIconLink>

export default {
  title: 'Composites/appkit-wui-icon-link',
  args: {
    size: 'md',
    disabled: false,
    icon: 'copy',
    variant: 'accent'
  },
  argTypes: {
    size: {
      options: ['xs', 'sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    variant: {
      options: ['accent', 'primary', 'secondary'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    icon: {
      options: iconOptions,
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
      variant=${args.variant}
    ></wui-icon-link>`
}
