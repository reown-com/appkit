import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import type { IconType } from '@reown/appkit-ui/src/utils/TypeUtil'
import '@reown/appkit-ui/wui-link'
import type { WuiLink } from '@reown/appkit-ui/wui-link'

import { buttonLinkOptions, iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiLink & { iconLeft?: IconType; iconRight?: IconType }>

export default {
  title: 'Composites/appkit-wui-link',
  args: {
    disabled: false,
    variant: 'accent',
    size: 'md',
    icon: 'arrowTopRight'
  },
  argTypes: {
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' },
      variant: { type: 'boolean' }
    },
    variant: {
      options: buttonLinkOptions,
      control: { type: 'select' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <wui-link
      ?disabled=${args.disabled}
      size=${args.size}
      variant=${args.variant}
      icon=${args.icon}
    >
      Link</wui-link
    >
  `
}
