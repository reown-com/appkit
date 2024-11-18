import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-promo'
import type { WuiPromo } from '@reown/appkit-ui-new/src/composites/wui-promo'
import { html } from 'lit'

type Component = Meta<WuiPromo>

export default {
  title: 'Composites/wui-promo',
  args: {
    text: 'Activate your account'
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-promo text=${args.text}></wui-promo>`
}
