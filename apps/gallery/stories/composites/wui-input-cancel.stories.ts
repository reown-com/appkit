import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-input-cancel'
import type { WuiInputCancel } from '@web3modal/ui/src/composites/wui-input-cancel'
import { html } from 'lit'

type Component = Meta<WuiInputCancel>

export default {
  title: 'Composites/wui-input-cancel'
} as Component

export const Default: Component = {
  render: () => html`<wui-input-cancel></wui-input-cancel>`
}
