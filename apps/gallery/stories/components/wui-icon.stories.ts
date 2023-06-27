import type { Meta } from '@storybook/web-components'
import { clockSvg } from '@web3modal/ui/src/assets/svg/clock'
import { copySvg } from '@web3modal/ui/src/assets/svg/copy'
import { walletSvg } from '@web3modal/ui/src/assets/svg/wallet'
import '@web3modal/ui/src/components/wui-icon'
import type { WuiIcon } from '@web3modal/ui/src/components/wui-icon'
import { TemplateResult, html } from 'lit'

type Component = Meta<WuiIcon & { svg: keyof typeof svgOptions }>

const svgOptions: Record<string, TemplateResult<2>> = {
  copy: copySvg,
  wallet: walletSvg,
  clock: clockSvg
}

export default {
  title: 'Components/wui-icon',
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    size: 'md',
    color: 'inverse-000',
    svg: 'copy'
  },
  argTypes: {
    size: {
      options: ['xxs', 'xs', 'sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    color: {
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

export const Default: Component = {
  render: args =>
    html`<wui-icon size=${args.size} color=${args.color}>${svgOptions[args.svg]}</wui-icon>`
}
