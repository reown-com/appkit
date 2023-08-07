import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-chip'
import type { WuiChip } from '@web3modal/ui/src/composites/wui-chip'
import { html } from 'lit'
import {
  chipOptions,
  externalLink,
  iconOptions,
  walletImagesOptions
} from '../../utils/PresetUtils'

type Component = Meta<WuiChip>

export default {
  title: 'Composites/wui-chip',
  args: {
    variant: 'fill',
    icon: 'externalLink',
    imageSrc: walletImagesOptions[3]?.src,
    href: externalLink
  },
  argTypes: {
    variant: {
      options: chipOptions,
      control: { type: 'select' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-chip
      icon=${args.icon}
      variant=${args.variant}
      href=${args.href}
      .imageSrc=${args.imageSrc}
    ></wui-chip>`
}
