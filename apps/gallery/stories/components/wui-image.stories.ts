import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/components/wui-image'
import type { WuiImage } from '@web3modal/ui/src/components/wui-image'
import { html } from 'lit'

type Component = Meta<WuiImage>

export default {
  title: 'Components/wui-image',
  args: {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=a8d876c6f91c3748db621583fad358f1',
    alt: 'Image of Rainbow'
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-image src=${args.src} alt=${args.alt}></wui-image>`
}
