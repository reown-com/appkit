import type { Meta } from '@storybook/web-components'
import { clockSvg } from '@web3modal/ui/src/assets/svg/clock'
import { copySvg } from '@web3modal/ui/src/assets/svg/copy'
import { walletSvg } from '@web3modal/ui/src/assets/svg/wallet'
import '@web3modal/ui/src/components/wui-icon-box'
import type { WuiIconBox } from '@web3modal/ui/src/components/wui-icon-box'
import { html } from 'lit'

type Component = Meta<WuiIconBox>

export default {
  title: 'Components/wui-icon-box',
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    size: 'md',
    backgroundColor: 'blue-100',
    iconColor: 'blue-100'
  },

  argTypes: {
    size: {
      defaultValue: 'md',
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    backgroundColor: {
      defaultValue: 'blue-100',
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
    },
    iconColor: {
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
  render: args =>
    html`<wui-icon-box
      size=${args.size}
      iconColor=${args.iconColor}
      backgroundColor=${args.backgroundColor}
      >${copySvg}</wui-icon-box
    >`
}

export const wallet: Component = {
  render: args =>
    html`<wui-icon-box
      size=${args.size}
      iconColor=${args.iconColor}
      backgroundColor=${args.backgroundColor}
      >${walletSvg}</wui-icon-box
    >`
}

export const clock: Component = {
  render: args =>
    html`<wui-icon-box
      size=${args.size}
      iconColor=${args.iconColor}
      backgroundColor=${args.backgroundColor}
      >${clockSvg}</wui-icon-box
    >`
}
