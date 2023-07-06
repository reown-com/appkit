import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/layout/wui-overlay'
import type { WuiOverlay } from '@web3modal/ui/src/layout/wui-overlay'
import { html } from 'lit'

type Component = Meta<WuiOverlay>

export default {
  title: 'Layout/wui-overlay'
} as Component

export const Default: Component = {
  render: () => html`
    <!-- Set to absolute instead of fixed to fit within story container -->
    <wui-overlay style="position: absolute"></wui-overlay>
  `
}
