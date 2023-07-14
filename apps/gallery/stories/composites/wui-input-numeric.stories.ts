import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-input-numeric'
import '../../components/gallery-container'
import type { WuiInputNumeric } from '@web3modal/ui/src/composites/wui-input-numeric'
import { html } from 'lit'

type Component = Meta<WuiInputNumeric>

export default {
  title: 'Composites/wui-input-numeric'
} as Component

export const Default: Component = {
  render: () => html` <wui-input-numeric></wui-input-numeric>`
}
