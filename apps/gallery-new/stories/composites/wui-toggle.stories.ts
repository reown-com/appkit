import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-toggle'
import type { WuiToggle } from '@reown/appkit-ui-new/src/composites/wui-toggle'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiToggle>

export default {
  title: 'Composites/wui-toggle',
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
