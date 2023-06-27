import type { Meta } from '@storybook/web-components'
import { clockSvg } from '@web3modal/ui/src/assets/svg/clock'
import { copySvg } from '@web3modal/ui/src/assets/svg/copy'
import { walletSvg } from '@web3modal/ui/src/assets/svg/wallet'
import '@web3modal/ui/src/components/wui-icon-box'
import type { WuiIconBox } from '@web3modal/ui/src/components/wui-icon-box'
import { html } from 'lit'
import type { TemplateResult } from 'lit'

type Component = Meta<WuiIconBox & { svg: keyof typeof svgOptions }>

const svgOptions: Record<string, TemplateResult<2>> = {
  copy: copySvg,
  wallet: walletSvg,
  clock: clockSvg
}

export default {
  title: 'Components/wui-icon-box',
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    size: 'md',
    backgroundColor: 'blue-100',
    iconColor: 'blue-100',
    svg: 'copy'
  },

  argTypes: {
    size: {
      defaultValue: 'md',
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    backgroundColor: {
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
    svg: {
      options: Object.keys(svgOptions),
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
      >${svgOptions[args.svg]}</wui-icon-box
    >`
}
