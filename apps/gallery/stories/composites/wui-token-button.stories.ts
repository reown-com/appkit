import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-token-button'
import type { WuiTokenButton } from '@web3modal/ui/src/composites/wui-token-button'
import { html } from 'lit'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiTokenButton>

export default {
  title: 'Composites/wui-token-button',
  args: {
    text: 'ETH',
    imageSrc: networkImageSrc
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-token-button text=${args.text} .imageSrc=${args.imageSrc}>Recent</wui-token-button>`
}
