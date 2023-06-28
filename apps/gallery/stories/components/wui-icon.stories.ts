import type { Meta } from '@storybook/web-components'
import { copySvg } from '@web3modal/ui/src/assets/svg/copy'
import { walletSvg } from '@web3modal/ui/src/assets/svg/wallet'
import '@web3modal/ui/src/components/wui-icon'
import type { WuiIcon } from '@web3modal/ui/src/components/wui-icon'
import { html } from 'lit'
import type { TemplateResult } from 'lit'
import { colorOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiIcon & { svg: keyof typeof svgOptions }>

const svgOptions: Record<string, TemplateResult<2>> = {
  copy: copySvg,
  wallet: walletSvg
}

export default {
  title: 'Components/wui-icon',
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
      options: colorOptions,
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
