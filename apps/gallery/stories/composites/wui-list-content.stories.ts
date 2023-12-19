import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-list-content'
import type { WuiListContent } from '@web3modal/ui/src/composites/wui-list-content'
import { html } from 'lit'
import '../../components/gallery-container'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiListContent>

export default {
  title: 'Composites/wui-list-content',
  args: {
    imageSrc: networkImageSrc,
    textTitle: 'Network',
    textValue: ''
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-content
        .imageSrc=${args.imageSrc}
        textTitle=${args.textTitle}
        .textValue=${args.textValue}
      ></wui-list-content>
    </gallery-container>`
}
