import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-icon-box'
import type { WuiIconBox } from '@reown/appkit-ui/wui-icon-box'

import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiIconBox>

export default {
  title: 'Composites/appkit-wui-icon-box',
  args: {
    icon: 'qrCode',
    size: 'md',
    color: 'default'
  },
  argTypes: {
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    size: {
      options: ['sm', 'md', 'lg', 'xl'],
      control: { type: 'select' }
    },
    color: {
      options: ['accent-primary', 'success', 'error', 'warning', 'default', 'inverse'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-icon-box .icon=${args.icon} .size=${args.size} .color=${args.color}></wui-icon-box>`
}
