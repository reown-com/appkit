import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-domain-chip'
import type { WuiDomainChip } from '@reown/appkit-ui-new/src/composites/wui-domain-chip'
import { html } from 'lit'
import { domainChipVariants } from '../../utils/PresetUtils'

type Component = Meta<WuiDomainChip>

export default {
  title: 'Composites/wui-domain-chip',
  args: {
    variant: 'success',
    size: 'md',
    disabled: false,
    text: 'reown.com/appkit'
  },
  argTypes: {
    variant: {
      options: domainChipVariants,
      control: { type: 'select' }
    },
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-domain-chip
      text=${args.text}
      size=${args.size}
      variant=${args.variant}
      ?disabled=${args.disabled}
    ></wui-domain-chip>`
}
