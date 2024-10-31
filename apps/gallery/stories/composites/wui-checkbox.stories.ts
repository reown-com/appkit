import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui/src/composites/wui-checkbox'
import '@reown/appkit-ui/src/components/wui-icon'
import type { WuiCheckBox } from '@reown/appkit-ui/src/composites/wui-checkbox'
import { html } from 'lit'

type Component = Meta<WuiCheckBox>

export default {
  title: 'Composites/wui-checkbox',
  args: {},
  argTypes: {}
} as Component

export const Default: Component = {
  render: () =>
    html`<wui-checkbox>I read and agree to <dapp>'s <b>Terms of Service</b></wui-checkbox>`
}
