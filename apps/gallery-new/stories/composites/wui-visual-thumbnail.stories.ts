import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-visual-thumbnail'
import type { WuiVisualThumbnail } from '@reown/appkit-ui-new/src/composites/wui-visual-thumbnail'
import { html } from 'lit'
import { walletImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiVisualThumbnail>

export default {
  title: 'Composites/wui-visual-thumbnail',
  args: {
    imageSrc: walletImageSrc,
    borderRadiusFull: true
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-visual-thumbnail
      ?borderRadiusFull=${args.borderRadiusFull}
      .imageSrc=${args.imageSrc}
    ></wui-visual-thumbnail>`
}
