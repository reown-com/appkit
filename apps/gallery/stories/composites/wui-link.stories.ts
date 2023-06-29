import type { Meta } from '@storybook/web-components'
import { copySvg } from '@web3modal/ui/src/assets/svg/copy'
import '@web3modal/ui/src/composites/wui-link'
import type { WuiLink } from '@web3modal/ui/src/composites/wui-link'
import { html } from 'lit'

type Component = Meta<WuiLink>

export default {
  title: 'Composites/wui-link',
  args: {
    disabled: false
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    },
    iconLeft: {
      options: { undefined, copySvg },
      control: { type: 'select' }
    },
    iconRight: {
      options: { undefined, copySvg },
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-link
      .iconLeft=${args.iconLeft}
      .iconRight=${args.iconRight}
      ?disabled=${args.disabled}
      >Link</wui-link
    >`
}
