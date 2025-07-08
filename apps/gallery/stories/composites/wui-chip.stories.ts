import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-chip'
import type { WuiChip } from '@reown/appkit-ui/wui-chip'

import {
  chipVariants,
  externalLink,
  iconOptions,
  walletImagesOptions
} from '../../utils/PresetUtils'

type Component = Meta<WuiChip>

export default {
  title: 'Composites/wui-chip',
  args: {
    variant: 'fill',
    disabled: false,
    icon: 'externalLink',
    imageSrc: walletImagesOptions[3]?.src,
    href: externalLink
  },
  argTypes: {
    variant: {
      options: chipVariants,
      control: { type: 'select' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    imageIcon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    imageIconSize: {
      options: ['xxs', 'xs', 'sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-chip
      icon=${args.icon}
      variant=${args.variant}
      href=${args.href}
      ?disabled=${args.disabled}
      .imageSrc=${args.imageSrc}
      .imageIcon=${args.imageIcon}
      .imageIconSize=${args.imageIconSize}
    ></wui-chip>`
}
