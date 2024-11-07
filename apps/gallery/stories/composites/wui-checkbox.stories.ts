import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui/src/composites/wui-checkbox'
import '@reown/appkit-ui/src/components/wui-icon'
import '@reown/appkit-ui/src/components/wui-text'
import type { WuiCheckBox } from '@reown/appkit-ui/src/composites/wui-checkbox'
import { html } from 'lit'

type Component = Meta<WuiCheckBox>

export default {
  title: 'Composites/wui-checkbox',
  args: {
    checked: false
  },
  argTypes: {
    checked: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-checkbox ?checked=${args.checked}></wui-checkbox>`
}
