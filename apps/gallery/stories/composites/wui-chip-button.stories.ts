import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-chip-button'
import type { WuiChipButton } from '@web3modal/ui/src/composites/wui-chip-button'
import { html } from 'lit'
import { chipOptions, iconOptions, walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiChipButton>

export default {
  title: 'Composites/wui-chip-button',
  args: {
    variant: 'fill',
    disabled: false,
    icon: 'externalLink',
    imageSrc: walletImagesOptions[3]?.src,
    text: 'dianeyes.walletconnect.eth'
  },
  argTypes: {
    variant: {
      options: chipOptions,
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
      variant=${args.variant}
      ?disabled=${args.disabled}
      .imageSrc=${args.imageSrc}
    ></wui-chip-button>`
}
