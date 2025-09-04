import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-chip-button'
import type { WuiChipButton } from '@reown/appkit-ui/wui-chip-button'

import {
  chipButtonSizes,
  chipButtonTypes,
  iconOptions,
  walletImagesOptions
} from '../../utils/PresetUtils'

type Component = Meta<WuiChipButton>

export default {
  title: 'Composites/apkt-chip-button',
  args: {
    type: 'accent',
    size: 'md',
    disabled: false,
    leftIcon: 'plus',
    rightIcon: 'externalLink',
    imageSrc: walletImagesOptions[3]?.src,
    text: 'dianeyes.walletconnect.eth'
  },
  argTypes: {
    type: {
      options: chipButtonTypes,
      control: { type: 'select' }
    },
    size: {
      options: chipButtonSizes,
      control: { type: 'select' }
    },
    leftIcon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    rightIcon: {
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
      type=${args.type}
      size=${args.size}
      .leftIcon=${args.leftIcon}
      .rightIcon=${args.rightIcon}
      text=${args.text}
      ?disabled=${args.disabled}
      .imageSrc=${args.imageSrc}
    ></wui-chip-button>`
}
