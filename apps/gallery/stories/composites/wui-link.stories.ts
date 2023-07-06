import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-link'
import type { WuiLink } from '@web3modal/ui/src/composites/wui-link'
import type { IconType } from '@web3modal/ui/src/utils/TypesUtil'
import { html } from 'lit'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiLink & { iconLeft?: IconType; iconRight?: IconType }>

export default {
  title: 'Composites/wui-link',
  args: {
    disabled: false,
    iconLeft: undefined,
    iconRight: undefined
  },
  argTypes: {
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
    html`<wui-link ?disabled=${args.disabled}>
      ${args.iconLeft
        ? html`<wui-icon
            size="xs"
            color="inherit"
            name=${args.iconLeft}
            slot="iconLeft"
          ></wui-icon>`
        : null}
      Link
      ${args.iconRight
        ? html`<wui-icon
            size="xs"
            color="inherit"
            name=${args.iconRight}
            slot="iconRight"
          ></wui-icon>`
        : null}
    </wui-link>`
}
