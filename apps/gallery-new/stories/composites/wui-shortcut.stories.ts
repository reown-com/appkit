import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui/src/composites/wui-shortcut'
import type { WuiShortcut } from '@reown/appkit-ui/src/composites/wui-shortcut'
import { html } from 'lit'

import { buttonShortcutOptions, colorOptions, iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiShortcut>

export default {
  title: 'Composites/wui-shortcut',
  args: {
    size: 'md',
    variant: 'accent',
    icon: 'copy',
    iconSize: 'lg',
    iconColor: 'accent-100',
    disabled: false
  },
  argTypes: {
    size: {
      defaultValue: 'lg',
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    variant: {
      options: buttonShortcutOptions,
      control: { type: 'select' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    iconSize: {
      defaultValue: 'lg',
      options: ['sm', 'md', 'lg', 'xl'],
      control: { type: 'select' }
    },
    iconColor: {
      options: colorOptions,
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-shortcut
      size=${args.size}
      variant=${args.variant}
      icon=${args.icon}
      iconColor=${args.iconColor}
      ?disabled=${args.disabled}
    ></wui-shortcut>`
}
