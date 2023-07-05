import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/layout/wui-overlay'
import type { WuiOverlay } from '@web3modal/ui/src/layout/wui-overlay'
import { html } from 'lit'
import '../../components/gallery-container'
import '../../components/gallery-placeholder'

type Component = Meta<WuiOverlay>

export default {
  title: 'Layout/wui-overlay'
} as Component

export const Default: Component = {
  render: () =>
    html`
      <gallery-container height="200">
        <!-- Set to absolute instead of fixed to fit within story container -->
        <wui-overlay style="position: absolute">
          <gallery-placeholder size="lg" background="red"></gallery-placeholder>
        </wui-overlay>
      </gallery-container>
    `
}
