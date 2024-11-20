import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/components/wui-divider'
import type { WuiDivider } from '@reown/appkit-ui-new/src/components/wui-divider'
import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import '../../components/gallery-container'

type Component = Meta<WuiDivider>

export default {
  title: 'Components/wui-divider',
  args: {
    text: 'or'
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="200" height="100">
      <wui-divider text=${ifDefined(args.text)}></wui-divider>
    </gallery-container>`
}
