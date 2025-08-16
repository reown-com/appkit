import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import type { WuiListSocial } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-list-social'

import '../../components/gallery-container'

type Component = Meta<WuiListSocial>

export default {
  title: 'Composites/appkit-wui-list-social',
  args: {
    name: 'google',
    logo: 'google',
    disabled: false
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-social
        ?disabled=${args.disabled}
        logo=${args.logo}
        name=${args.name}
      ></wui-list-social>
    </gallery-container>`
}
