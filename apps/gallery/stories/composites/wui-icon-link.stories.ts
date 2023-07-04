import type { Meta } from '@storybook/web-components'
import { closeSvg } from '@web3modal/ui/src/assets/svg/close'
import '@web3modal/ui/src/composites/wui-icon-link'
import type { WuiIconLink } from '@web3modal/ui/src/composites/wui-icon-link'
import { html } from 'lit'

type Component = Meta<WuiIconLink>

export default {
  title: 'Composites/wui-icon-link',
  args: {
    size: 'md',
    disabled: false
  },

  argTypes: {
    size: {
      defaultValue: 'md',
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-icon-link ?disabled=${args.disabled} size=${args.size}>${closeSvg}</wui-icon-link>`
}
