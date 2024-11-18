import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui/src/composites/wui-select'
import type { WuiSelect } from '@reown/appkit-ui/src/composites/wui-select'
import { html } from 'lit'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiSelect>

export default {
  title: 'Composites/wui-select',
  args: {
    imageSrc: networkImageSrc
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-select imageSrc=${args.imageSrc}></wui-select>`
}
