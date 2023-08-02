import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/layout/wui-separator'
import '../../components/gallery-container/index.js'
import type { WuiSeparator } from '@web3modal/ui/src/layout/wui-separator'
import { html } from 'lit'

type Component = Meta<WuiSeparator>

export default {
  title: 'Layout/wui-separator',
  args: {
    showText: false
  },
  argTypes: {
    showText: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container
      style="background-color: var(--wui-color-bg-100);"
      width="200"
      height="100"
      ><wui-separator ?showText=${args.showText}></wui-separator
    ></gallery-container>`
}
