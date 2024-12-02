import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-icon-button'
import type { WuiIconButton } from '@reown/appkit-ui-new/src/composites/wui-icon-button'
import { html } from 'lit'
import '../../components/gallery-container'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiIconButton>

export default {
  title: 'Composites/wui-icon-button',
  args: {
    icon: 'card',
    size: 'md',
    variant: 'neutral-primary',
    disabled: false
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
      options: ['neutral-primary', 'neutral-secondary', 'accent-primary'],
      control: { type: 'select' }
    },
    disabled: {
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
        ?disabled=${args.disabled}
      ></wui-icon-button>
    </gallery-container>
  `
}
