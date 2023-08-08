import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-tag'
import type { WuiTag } from '@web3modal/ui/src/composites/wui-tag'
import { html } from 'lit'
import { tagOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiTag>

export default {
  title: 'Composites/wui-tag',
  args: {
    variant: 'main'
  },
  argTypes: {
    variant: {
      options: tagOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-tag variant=${args.variant}>Recent</wui-tag>`
}
