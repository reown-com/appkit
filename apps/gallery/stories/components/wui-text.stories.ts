import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/components/wui-text'
import type { WuiText } from '@web3modal/ui/src/components/wui-text'
import { html } from 'lit'
import { colorOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiText>

export default {
  title: 'Components/wui-text',
  args: {
    variant: 'md-medium',
    color: 'inverse-100'
  },
  argTypes: {
    variant: {
      options: [
        'lg-semibold',
        'lg-medium',
        'md-bold',
        'md-semibold',
        'md-medium',
        'md-numerals',
        'sm-semibold',
        'sm-medium',
        'xxs-bold'
      ],
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
