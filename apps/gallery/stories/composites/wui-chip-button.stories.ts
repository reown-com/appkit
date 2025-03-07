import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-chip-button'
import type { WuiChipButton } from '@reown/appkit-ui/wui-chip-button'

import { chipButtonVariants, iconOptions, walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiChipButton>

export default {
  title: 'Composites/wui-chip-button',
  args: {
    variant: 'main',
    size: 'md',
    disabled: false,
    icon: 'externalLink',
    imageSrc: walletImagesOptions[3]?.src,
    text: 'dianeyes.walletconnect.eth'
  },
  argTypes: {
    variant: {
      options: chipButtonVariants,
      control: { type: 'select' }
    },
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-chip-button
      icon=${args.icon}
      text=${args.text}
      size=${args.size}
      variant=${args.variant}
      ?disabled=${args.disabled}
      .imageSrc=${args.imageSrc}
    ></wui-chip-button>`
}
