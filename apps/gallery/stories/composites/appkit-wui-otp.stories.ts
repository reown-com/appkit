import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-otp'
import type { WuiOtp } from '@reown/appkit-ui/wui-otp'

import '../../components/gallery-container'

type Component = Meta<WuiOtp>

export default {
  title: 'Composites/appkit-wui-otp',
  args: {
    length: 6
  }
} as Component

export const Default: Component = {
  render: args => html` <wui-otp length=${args.length}></wui-otp>`
}
