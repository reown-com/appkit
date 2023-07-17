import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-otp'
import '../../components/gallery-container'
import type { WuiOtp } from '@web3modal/ui/src/composites/wui-otp'
import { html } from 'lit'

type Component = Meta<WuiOtp>

export default {
  title: 'Composites/wui-otp'
} as Component

export const Default: Component = {
  render: () => html` <wui-otp></wui-otp>`
}
