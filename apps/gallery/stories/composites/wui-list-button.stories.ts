import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import type { WuiListButton } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-list-button'

import '../../components/gallery-container'

type Component = Meta<WuiListButton>

export default {
  title: 'Composites/wui-list-button',
  args: {
    text: 'Continue with a wallet'
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-button text=${args.text}></wui-list-button>
    </gallery-container>`
}
