import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-tabs'
import type { WuiTabs } from '@web3modal/ui/src/composites/wui-tabs'
import { html } from 'lit'

type Component = Meta<WuiTabs>

export default {
  title: 'Composites/wui-tabs',
  args: {
    tabs: [
      { icon: 'mobile', label: 'Mobile' },
      { icon: 'extension', label: 'Browser' },
      { icon: 'desktop', label: 'Desktop' }
    ],
    onTabChange: _index => null,
    disabled: false
  },

  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-tabs
      .tabs=${args.tabs}
      ?disabled=${args.disabled}
      .onTabChange=${args.onTabChange}
    ></wui-tabs>`
}
