import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-alertbar'
import type { WuiAlertBar } from '@reown/appkit-ui/wui-alertbar'

import '../../components/gallery-container'
import { colorOptions, iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiAlertBar>

export default {
  title: 'Composites/wui-alertbar',
  args: {
    message: 'Alert',
    backgroundColor: 'fg-350',
    iconColor: 'fg-325',
    icon: 'info'
  },
  argTypes: {
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
  render: args => html`
    <gallery-container width="336">
      <wui-alertbar
        iconColor=${args.iconColor}
        backgroundColor=${args.backgroundColor}
        icon=${args.icon}
        message=${args.message}
      >
      </wui-alertbar>
    </gallery-container>
  `
}
