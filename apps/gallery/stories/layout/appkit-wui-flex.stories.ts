import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-flex'
import type { WuiFlex } from '@reown/appkit-ui/wui-flex'

import '../../components/gallery-placeholder'
import {
  flexAlignItemsOptions,
  flexBasisOptions,
  flexDirectionOptions,
  flexGrowOptions,
  flexJustifyContentOptions,
  flexShrinkOptions,
  flexWrapOptions,
  spacingOptions
} from '../../utils/PresetUtils'

type Component = Meta<WuiFlex>

export default {
  title: 'Layout/appkit-wui-flex',
  args: {
    gap: 'm'
  },
  argTypes: {
    flexDirection: {
      options: flexDirectionOptions,
      control: { type: 'select' }
    },
    flexWrap: {
      options: flexWrapOptions,
      control: { type: 'select' }
    },
    flexBasis: {
      options: flexBasisOptions,
      control: { type: 'select' }
    },
    flexGrow: {
      options: flexGrowOptions,
      control: { type: 'select' }
    },
    flexShrink: {
      options: flexShrinkOptions,
      control: { type: 'select' }
    },
    alignItems: {
      options: flexAlignItemsOptions,
      control: { type: 'select' }
    },
    justifyContent: {
      options: flexJustifyContentOptions,
      control: { type: 'select' }
    },
    columnGap: {
      options: [...spacingOptions, undefined],
      control: { type: 'select' }
    },
    rowGap: {
      options: [...spacingOptions, undefined],
      control: { type: 'select' }
    },
    gap: {
      options: [...spacingOptions, undefined],
      control: { type: 'select' }
    },
    padding: {
      options: [...spacingOptions, undefined],
      control: { type: 'select' }
    },
    margin: {
      options: [...spacingOptions, undefined],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-flex
      .flexDirection=${args.flexDirection}
      .flexWrap=${args.flexWrap}
      .flexBasis=${args.flexBasis}
      .flexGrow=${args.flexGrow}
      .flexShrink=${args.flexShrink}
      .alignItems=${args.alignItems}
      .justifyContent=${args.justifyContent}
      .columnGap=${args.columnGap}
      .rowGap=${args.rowGap}
      .gap=${args.gap}
      .padding=${args.padding}
      .margin=${args.margin}
    >
      <gallery-placeholder size="sm" background="green"></gallery-placeholder>
      <gallery-placeholder size="lg" background="red"></gallery-placeholder>
      <gallery-placeholder size="md" background="blue"></gallery-placeholder>
    </wui-flex>`
}
