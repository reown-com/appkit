import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-tabs'
import type { WuiTabs } from '@reown/appkit-ui-new/src/composites/wui-tabs'
import { html } from 'lit'

type Component = Meta<WuiTabs>

export default {
  title: 'Composites/wui-tabs',
  args: {
    size: 'md',
    tabs: [
      { icon: 'allWallets', label: 'Wallets' },
      { icon: 'externalLink', label: 'External' },
      { icon: 'info', label: 'Info' }
    ],
    onTabChange: () => null
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-tabs
      size=${args.size}
      .tabs=${args.tabs}
      .onTabChange=${args.onTabChange}
    ></wui-tabs>`
}
