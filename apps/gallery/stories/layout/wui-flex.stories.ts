import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/layout/wui-flex'
import type { WuiFlex } from '@web3modal/ui/src/layout/wui-flex'
import { html } from 'lit'

type Component = Meta<WuiFlex>

export default {
  title: 'Layout/wui-flex'
} as Component

export const Default: Component = {
  render: () => html`<wui-flex width="100px" height="100px"><div></div></wui-flex>`
}
