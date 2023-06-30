import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/components/wui-text'
import type { WuiText } from '@web3modal/ui/src/components/wui-text'
import { html } from 'lit'
import { colorOptions, textOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiText>

export default {
  title: 'Components/wui-text',
  args: {
    variant: 'paragraph-500',
    color: 'fg-100'
  },
  argTypes: {
    variant: {
      options: textOptions,
      control: { type: 'select' }
    },
    color: {
      options: colorOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-text variant=${args.variant} color=${args.color}
      >The fox jumped over the lazy dog</wui-text
    >`
}
