import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-connect-button'
import type { WuiConnectButton } from '@web3modal/ui/src/composites/wui-connect-button'
import { html } from 'lit'

type Component = Meta<WuiConnectButton>

export default {
  title: 'Composites/wui-connect-button',
  args: {
    size: 'md',
    disabled: false,
    loading: false,
    text: 'Connect Wallet'
  },
  argTypes: {
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    loading: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-connect-button
      size=${args.size}
      ?loading=${args.loading}
      ?disabled=${args.disabled}
      text=${args.text}
    ></wui-connect-button>`
}
