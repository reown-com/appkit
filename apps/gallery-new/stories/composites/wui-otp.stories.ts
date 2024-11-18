import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-otp'
import type { WuiOtp } from '@reown/appkit-ui-new/src/composites/wui-otp'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiOtp>

export default {
  title: 'Composites/wui-otp',
  args: {
    length: 6
  }
} as Component

export const Default: Component = {
  render: args => html` <wui-otp length=${args.length}></wui-otp>`
}
