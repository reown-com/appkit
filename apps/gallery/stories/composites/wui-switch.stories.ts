import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui/src/composites/wui-switch'
import type { WuiSwitch } from '@reown/appkit-ui/src/composites/wui-switch'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiSwitch>

export default {
  title: 'Composites/wui-switch',
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
  render: args => html`
    <gallery-container width="32" height="32">
      <wui-switch ?checked=${args.checked}></wui-switch>
    </gallery-container>
  `
}
