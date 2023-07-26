import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-card-select'
import type { WuiCardSelect } from '@web3modal/ui/src/composites/wui-card-select'
import { html } from 'lit'
import '../../components/gallery-container'
import { cardSelectOptions, walletImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiCardSelect>

export default {
  title: 'Composites/wui-card-select',
  args: {
    imageSrc: walletImageSrc,
    name: 'Rainbow',
    disabled: false,
    type: 'wallet',
    selected: false
  },
  argTypes: {
    type: {
      options: cardSelectOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="76"
      ><wui-card-select
        type=${args.type}
        .imageSrc=${args.imageSrc}
        ?disabled=${args.disabled}
        name=${args.name}
        .selected=${args.selected}
      ></wui-card-select>
    </gallery-container>
  `
}
