import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-icon-button'
import type { WuiIconButton } from '@reown/appkit-ui/wui-icon-button'

import '../../components/gallery-container'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiIconButton>

export default {
  title: 'Composites/appkit-wui-icon-button',
  args: {
    icon: 'card',
    size: 'sm',
    variant: 'primary',
    type: 'accent',
    disabled: false,
    fullWidth: false
  },
  argTypes: {
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    size: {
      options: ['xs', 'sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    variant: {
      options: ['primary', 'secondary'],
      control: { type: 'select' }
    },
    type: {
      options: ['accent', 'neutral', 'success', 'error'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    fullWidth: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="120">
      <wui-icon-button
        icon=${args.icon}
        size=${args.size}
        variant=${args.variant}
        type=${args.type}
        ?disabled=${args.disabled}
        ?fullWidth=${args.fullWidth}
      ></wui-icon-button>
    </gallery-container>
  `
}
