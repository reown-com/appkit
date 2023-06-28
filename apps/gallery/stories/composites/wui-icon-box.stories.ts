import type { Meta } from '@storybook/web-components'
import { copySvg } from '@web3modal/ui/src/assets/svg/copy'
import { walletSvg } from '@web3modal/ui/src/assets/svg/wallet'
import '@web3modal/ui/src/composites/wui-icon-box'
import type { WuiIconBox } from '@web3modal/ui/src/composites/wui-icon-box'
import { html } from 'lit'
import type { TemplateResult } from 'lit'
import { colorOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiIconBox & { svg: keyof typeof svgOptions }>

const svgOptions: Record<string, TemplateResult<2>> = {
  copy: copySvg,
  wallet: walletSvg
}

export default {
  title: 'Composites/wui-icon-box',
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
      options: colorOptions,
      control: { type: 'select' }
    },
    iconColor: {
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
    html`<wui-icon-box
      size=${args.size}
      iconColor=${args.iconColor}
      backgroundColor=${args.backgroundColor}
      >${svgOptions[args.svg]}</wui-icon-box
    >`
}
