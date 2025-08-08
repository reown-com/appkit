import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-tabs'
import type { WuiTabs } from '@reown/appkit-ui/wui-tabs'

type Component = Meta<WuiTabs>

export default {
  title: 'Composites/appkit-wui-tabs',
  args: {
    size: 'md',
    tabs: [
      { icon: 'mobile', label: 'Mobile' },
      { icon: 'browser', label: 'Web App' },
      { icon: 'extension', label: 'Browser' },
      { icon: 'desktop', label: 'Desktop' }
    ],
    onTabChange: () => null
  },
  argTypes: {
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-tabs
      style="width: 400px"
      size=${args.size}
      .tabs=${args.tabs}
      .onTabChange=${args.onTabChange}
    ></wui-tabs>`
}

export const TextForActiveOnly: Component = {
  render: args =>
    html`<wui-tabs
      style="width: 400px"
      size=${args.size}
      .tabs=${args.tabs}
      .onTabChange=${args.onTabChange}
    ></wui-tabs>`
}
