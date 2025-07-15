import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-semantic-chip'
import type { WuiSemanticChip } from '@reown/appkit-ui/wui-semantic-chip'

import { semanticChipSizes, semanticChipTypes } from '../../utils/PresetUtils'

type Component = Meta<WuiSemanticChip>

export default {
  title: 'Composites/appkit-wui-semantic-chip',
  args: {
    type: 'success',
    text: 'app.uniswap.org',
    size: 'md',
    href: 'https://app.uniswap.org',
    disabled: false
  },
  argTypes: {
    type: {
      options: semanticChipTypes,
      control: { type: 'select' }
    },
    size: {
      options: semanticChipSizes,
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-semantic-chip
      type=${args.type}
      size=${args.size}
      href=${args.href}
      .text=${args.text}
      ?disabled=${args.disabled}
    ></wui-semantic-chip>`
}
