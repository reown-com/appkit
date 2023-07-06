import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-button'
import type { WuiButton } from '@web3modal/ui/src/composites/wui-button'
import { html, nothing } from 'lit'
import { iconOptions } from '../../utils/PresetUtils'
import type { IconType } from '@web3modal/ui/src/utils/TypesUtil'

type Component = Meta<WuiButton & { iconLeft?: IconType; iconRight?: IconType }>

export default {
  title: 'Composites/wui-button',
  args: {
    size: 'md',
    variant: 'fill',
    disabled: false,
    iconLeft: undefined,
    iconRight: undefined
  },
  argTypes: {
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    },
    variant: {
      options: ['fill', 'shade', 'accent'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    iconLeft: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    iconRight: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-button size=${args.size} ?disabled=${args.disabled} variant=${args.variant}>
      ${args.iconLeft !== undefined
        ? html`<wui-icon
            size="sm"
            color="inherit"
            name=${args.iconLeft}
            slot="iconLeft"
          ></wui-icon>`
        : nothing}
      Button
      ${args.iconRight !== undefined
        ? html`<wui-icon
            size="sm"
            color="inherit"
            name=${args.iconRight}
            slot="iconRight"
          ></wui-icon>`
        : nothing}
    </wui-button>`
}
