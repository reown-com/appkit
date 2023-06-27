import type { Meta } from '@storybook/web-components'
import { clockSvg } from '@web3modal/ui/src/assets/svg/clock'
import { copySvg } from '@web3modal/ui/src/assets/svg/copy'
import { walletSvg } from '@web3modal/ui/src/assets/svg/wallet'
import '@web3modal/ui/src/components/wui-icon'
import type { WuiIcon } from '@web3modal/ui/src/components/wui-icon'
import { html } from 'lit'

type Component = Meta<WuiIcon>

export default {
  title: 'Components/wui-icon',
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    size: 'md'
  },
  argTypes: {
    size: {
      defaultValue: 'md',
      options: ['xxs', 'xs', 'sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    color: {
      defaultValue: 'inverse-100',
      options: [
        'blue-100',
        'error-100',
        'success-100',
        'inverse-100',
        'inverse-000',
        'fg-100',
        'fg-200',
        'fg-300'
      ],
      control: { type: 'select' }
    }
  }
} as Component

export const copy: Component = {
  render: args => html`<wui-icon size=${args.size} color=${args.color}>${copySvg}</wui-icon>`
}

export const wallet: Component = {
  render: args => html`<wui-icon size=${args.size} color=${args.color}>${walletSvg}</wui-icon>`
}

export const clock: Component = {
  render: args => html`<wui-icon size=${args.size} color=${args.color}>${clockSvg}</wui-icon>`
}
