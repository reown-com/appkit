import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/components/wui-example-component'
import type { WuiExampleComponent } from '@web3modal/ui/src/components/wui-example-component'
import { html } from 'lit'

type Component = Meta<WuiExampleComponent>

export default {
  title: 'wui-example-component',
  render: args => html`<wui-example-component color=${args.color}></wui-example-component>`
} as Component

export const Preview: Component = {
  argTypes: {
    color: {
      options: ['red', 'blue', 'orange'],
      control: { type: 'select' },
      defaultValue: 'blue'
    }
  }
}
