import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-ux-by-reown'
import type { WuiUxByReown } from '@reown/appkit-ui/wui-ux-by-reown'

// Define the component type

type Component = Meta<WuiUxByReown>

export default {
  title: 'Composites/appkit-wui-ux-by-reown',
  args: {},
  argTypes: {}
} as Component

export const Default: Component = {
  render: () => html`<wui-ux-by-reown></wui-ux-by-reown>`
}
