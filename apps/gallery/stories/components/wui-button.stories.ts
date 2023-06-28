import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/components/wui-button'
import type { WuiButton } from '@web3modal/ui/src/components/wui-button'
import { html } from 'lit'

type Component = Meta<WuiButton>

export default {
  title: 'Components/wui-button',
  args: {
    size: 'md',
    variant: 'fill',
    disabled: false
  },
  argTypes: {
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    },
    variant: {
      options: ['fill', 'shade', 'accent'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-button size=${args.size} ?disabled=${args.disabled} variant=${args.variant}
      >Button</wui-button
    >`
}
