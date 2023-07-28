import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-tabs'
import type { WuiTabs } from '@web3modal/ui/src/composites/wui-tabs'
import { html } from 'lit'

type Component = Meta<WuiTabs>

export default {
  title: 'Composites/wui-tabs',
  args: {},

  argTypes: {}
} as Component

export const Default: Component = {
  render: args =>
    html` <wui-tabs><span>one</span><span>two</span><span>three</span></span></wui-tabs>`
}
