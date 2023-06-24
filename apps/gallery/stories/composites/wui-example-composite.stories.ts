import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-example-composite'
import type { WuiExampleComposite } from '@web3modal/ui/src/composites/wui-example-composite'
import { html } from 'lit'

type Component = Meta<WuiExampleComposite>

export default {
  title: 'wui-example-composite',
  render: args => html`<wui-example-composite .uppercase=${args.uppercase}></wui-example-composite>`
} as Component

export const Preview: Component = {
  argTypes: {
    uppercase: {
      options: [true, false],
      control: { type: 'boolean' }
    }
  }
}
