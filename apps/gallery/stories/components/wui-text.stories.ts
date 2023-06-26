import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/components/wui-text'
import type { WuiText } from '@web3modal/ui/src/components/wui-text'
import { html } from 'lit'

type Component = Meta<WuiText>

export default {
  title: 'Components/wui-text',
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],

  render: args =>
    html`<wui-text variant=${args.variant} color=${args.color}
      >The fox jumped over the lazy dog</wui-text
    >`
} as Component

export const Preview: Component = {
  argTypes: {
    variant: {
      defaultValue: 'md-medium',
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
      defaultValue: 'inverse',
      options: ['accent', 'error', 'inverse', 'primary', 'secondary', 'tertiary', 'success'],
      control: { type: 'select' }
    }
  }
}
