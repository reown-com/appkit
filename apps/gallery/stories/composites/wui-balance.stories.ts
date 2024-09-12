import type { Meta } from '@storybook/web-components'
import '@rerock/appkit-ui/src/composites/wui-balance'
import type { WuiBalance } from '@rerock/appkit-ui/src/composites/wui-balance'
import { html } from 'lit'

type Component = Meta<WuiBalance>

export default {
  title: 'Composites/wui-balance',
  args: {
    dollars: '4,798',
    pennies: '75'
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-balance pennies=${args.pennies} dollars=${args.dollars}></wui-balance>`
}
