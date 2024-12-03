import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-icon-box'
import type { WuiIconBox } from '@reown/appkit-ui-new/src/composites/wui-icon-box'
import { html } from 'lit'

import { backgroundColorOptions, iconColorOptions, iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiIconBox>

export default {
  title: 'Composites/wui-icon-box',
  args: {
    iconColor: 'inverse',
    iconSize: 'xl',
    backgroundColor: 'foregroundSecondary',
    icon: 'qrCode'
  },
  argTypes: {
    iconColor: {
      options: iconColorOptions,
      control: { type: 'select' }
    },
    iconSize: {
      options: ['xl', 'md', 'sm', 'xs'],
      control: { type: 'select' }
    },
    backgroundColor: {
      options: backgroundColorOptions,
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
      iconColor=${args.iconColor}
      iconSize=${args.iconSize}
      backgroundColor=${args.backgroundColor}
      icon=${args.icon}
    ></wui-icon-box>`
}
