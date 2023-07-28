import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-tabs'
import type { WuiTabs } from '@web3modal/ui/src/composites/wui-tabs'
import { html } from 'lit'

type Component = Meta<WuiTabs>

export default {
  title: 'Composites/wui-tabs',
  args: {
    tabs: [
      { icon: 'checkmark', label: 'one' },
      { icon: 'checkmark', label: 'two' },
      { icon: 'checkmark', label: 'three' }
    ],
    activeTab: 1
  },

  argTypes: {}
} as Component

export const Default: Component = {
  render: args => html`<wui-tabs .tabs=${args.tabs} activeTab=${args.activeTab}></wui-tabs>`
}
