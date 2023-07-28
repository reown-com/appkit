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
      { icon: 'extension', label: 'Extension' },
      { icon: 'desktop', label: 'Desktop' }
    ],
    activeTab: 1
  },

  argTypes: {}
} as Component

export const Default: Component = {
  render: args => html`<wui-tabs .tabs=${args.tabs} activeTab=${args.activeTab}></wui-tabs>`
}
