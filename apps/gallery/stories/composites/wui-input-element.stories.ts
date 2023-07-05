import type { Meta } from '@storybook/web-components'
import { closeSvg } from '@web3modal/ui/src/assets/svg/close'
import '@web3modal/ui/src/composites/wui-input-element'
import type { WuiInputElement } from '@web3modal/ui/src/composites/wui-input-element'
import { html } from 'lit'

type Component = Meta<WuiInputElement>

export default {
  title: 'Composites/wui-input-element'
} as Component

export const Default: Component = {
  render: () => html`<wui-input-element .icon=${closeSvg}></wui-input-element>`
}
