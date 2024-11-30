import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-link'
import type { WuiLink } from '@reown/appkit-ui-new/src/composites/wui-link'
import type { IconType } from '@reown/appkit-ui-new/src/utils/TypeUtil'
import { html } from 'lit'
import { buttonLinkOptions, iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiLink & { iconLeft?: IconType; iconRight?: IconType }>

export default {
  title: 'Composites/wui-link',
  args: {
    disabled: false,
    icon: 'arrowTopRight',
    variant: 'accent',
    size: 'md'
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
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    variant: {
      options: buttonLinkOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <wui-link
      ?disabled=${args.disabled}
      icon=${args.icon}
      size=${args.size}
      variant=${args.variant}
    >
      Link
    </wui-link>
  `
}
