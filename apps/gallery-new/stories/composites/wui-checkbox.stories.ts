import type { Meta } from '@storybook/web-components'
import type { WuiCheckBox } from '@reown/appkit-ui-new/src/composites/wui-checkbox'
import { html } from 'lit'

type Component = Meta<WuiCheckBox>

export default {
  title: 'Composites/wui-checkbox',
  args: {
    disabled: false,
    size: 'md'
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    },
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-checkbox ?disabled=${args.disabled} size=${args.size}></wui-checkbox>`
}
