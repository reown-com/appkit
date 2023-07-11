import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-account-entry'
import '../../components/gallery-container'
import '@web3modal/ui/src/layout/wui-flex'
import type { WuiAccountEntry } from '@web3modal/ui/src/composites/wui-account-entry'
import { html } from 'lit'
import { accountEntryOptions, iconOptions, networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiAccountEntry>

export default {
  title: 'Composites/wui-account-entry',
  args: {
    disabled: false,
    icon: 'swap',
    variant: 'image',
    imageSrc: networkImageSrc,
    alt: 'Ethereum',
    iconVariant: 'blue'
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    },
    variant: {
      options: accountEntryOptions,
      control: { type: 'select' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    iconVariant: {
      options: ['blue', 'overlay'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-account-entry
        variant=${args.variant}
        .icon=${args.icon}
        .imageSrc=${args.imageSrc}
        .alt=${args.alt}
        .iconVariant=${args.iconVariant}
        ?disabled=${args.disabled}
      >
        <wui-flex gap="3xs">
          <wui-text variant="paragraph-500" color="fg-100">0.527 ETH</wui-text>
          <wui-text variant="paragraph-500" color="fg-200">607.38 USD</wui-text>
        </wui-flex>
      </wui-account-entry>
    </gallery-container>`
}
