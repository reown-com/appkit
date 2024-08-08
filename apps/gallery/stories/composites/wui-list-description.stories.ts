import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-list-description'
import type { WuiListDescription } from '@web3modal/ui/src/composites/wui-list-description'
import { html } from 'lit'
import '../../components/gallery-container'
import { colorOptions, iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiListDescription>

export default {
  title: 'Composites/wui-list-description',
  args: {
    icon: 'card',
    text: 'Buy Crypto',
    tag: 'Popular',
    description: 'Easy with card or bank account',
    iconBackgroundColor: 'success-100',
    iconColor: 'success-100'
  },
  argTypes: {
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    iconBackgroundColor: {
      options: colorOptions,
      control: { type: 'select' }
    },
    iconColor: {
      options: colorOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-description
        icon=${args.icon}
        text=${args.text}
        .tag=${args.tag}
        description=${args.description}
        iconBackgroundColor=${args.iconBackgroundColor}
        iconColor=${args.iconColor}
      ></wui-list-description>
    </gallery-container>`
}
