import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui/src/composites/wui-qr-code'
import type { WuiQrCode } from '@reown/appkit-ui/src/composites/wui-qr-code'
import { html } from 'lit'
import { themeOptions, walletImageSrc } from '../../utils/PresetUtils'
import { ifDefined } from 'lit/directives/if-defined.js'

type Component = Meta<WuiQrCode>

export default {
  title: 'Composites/wui-qr-code',
  args: {
    size: 318,
    theme: 'dark',
    uri: 'wc:139520827546986d057472f8bbd7ef0484409458034b61cca59d908563773c7a@2?relay-protocol=irn&symKey=43b5fad11bf07bc8a0aa12231435a4ad3e72e2d1fa257cf191a90ec5b62cb0a3',
    imageSrc: walletImageSrc,
    alt: 'Rainbow'
  },
  argTypes: {
    theme: {
      options: themeOptions,
      control: { type: 'select' }
    },
    color: {
      control: { type: 'color' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-qr-code
      .alt=${args.alt}
      .imageSrc=${args.imageSrc}
      theme=${args.theme}
      uri=${args.uri}
      size=${args.size}
      color=${ifDefined(args.color)}
    ></wui-qr-code>`
}
