import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/layout/wui-separator'
import type { WuiSeparator } from '@web3modal/ui/src/layout/wui-separator'
import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import '../../components/gallery-container'

type Component = Meta<WuiSeparator>

export default {
  title: 'Layout/wui-separator',
  args: {
    text: 'or'
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container
      style="background-color: var(--wui-color-bg-100);"
      width="200"
      height="100"
      ><wui-separator text=${ifDefined(args.text)}></wui-separator
    ></gallery-container>`
}
