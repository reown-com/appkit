import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/src/components/wui-icon'
import '@reown/appkit-ui/src/components/wui-text'
import '@reown/appkit-ui/src/composites/wui-checkbox'
import type { WuiCheckBox } from '@reown/appkit-ui/src/composites/wui-checkbox'

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
