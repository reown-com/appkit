import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-certified-switch'
import type { WuiCertifiedSwitch } from '@reown/appkit-ui-new/src/composites/wui-certified-switch'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiCertifiedSwitch>

export default {
  title: 'Composites/wui-certified-switch',
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
    <gallery-container width="88" height="44">
      <wui-certified-switch ?checked=${args.checked}></wui-certified-switch>
    </gallery-container>
  `
}
