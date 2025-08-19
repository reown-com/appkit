import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-connect-button'
import type { WuiConnectButton } from '@reown/appkit-ui/wui-connect-button'

type Component = Meta<WuiConnectButton>

export default {
  title: 'Composites/appkit-wui-connect-button',
  args: {
    size: 'md',
    variant: 'primary',
    loading: false,
    text: 'Connect Wallet'
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    variant: {
      options: ['primary', 'secondary'],
      control: { type: 'select' }
    },
    loading: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <wui-connect-button
      size=${args.size}
      variant=${args.variant}
      ?loading=${args.loading}
      text=${args.text}
    >
    </wui-connect-button>
  `
}
