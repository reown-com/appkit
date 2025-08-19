import type { Meta } from '@storybook/web-components'

import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { WuiAlertBar } from '@reown/appkit-ui/wui-alertbar'
import '@reown/appkit-ui/wui-alertbar'
import '@reown/appkit-ui/wui-semantic-chip'

import '../../components/gallery-container'

type Component = Meta<WuiAlertBar>

export default {
  title: 'Composites/apkt-alertbar',
  args: {
    message: 'Transaction sent successfully',
    type: 'info'
  },
  argTypes: {
    message: { control: { type: 'text' } },
    type: {
      options: ['info', 'success', 'warning', 'error'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="336">
      <wui-alertbar message=${args.message} type=${ifDefined(args.type)}></wui-alertbar>
    </gallery-container>
  `
}
