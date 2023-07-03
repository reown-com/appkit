import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-card-select'
import '../../components/gallery-container'
import type { WuiCardSelect } from '@web3modal/ui/src/composites/wui-card-select'
import { html } from 'lit'
import { walletImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiCardSelect>

export default {
  title: 'Composites/wui-card-select',
  args: {
    imageSrc: walletImageSrc,
    name: 'Rainbow',
    disabled: false
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="76"
      ><wui-card-select
        imageSrc=${args.imageSrc}
        ?disabled=${args.disabled}
        name=${args.name}
      ></wui-card-select>
    </gallery-container>
  `
}
