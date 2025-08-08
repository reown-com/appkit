import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-toggle'
import type { WuiToggle } from '@reown/appkit-ui/wui-toggle'

import '../../components/gallery-container'

type Component = Meta<WuiToggle>

export default {
  title: 'Composites/appkit-wui-toggle',
  args: {
    size: 'sm',
    disabled: false
  },
  argTypes: {
    disabled: { control: 'boolean' },
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="200">
      <wui-toggle ?disabled=${args.disabled} size=${args.size}></wui-toggle>
    </gallery-container>
  `
}
