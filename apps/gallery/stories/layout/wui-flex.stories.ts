import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/layout/wui-flex'
import '../../components/wui-gallery-div'
import type { WuiFlex } from '@web3modal/ui/src/layout/wui-flex'
import { html } from 'lit'
import {
  flexDirectionOptions,
  flexWrapOptions,
  flexBasisOptions,
  flexGrowOptions,
  flexShrinkOptions,
  alignItemsOptions,
  justifyContentOptions,
  spacingOptions
} from '../../utils/PresetUtils'

type Component = Meta<WuiFlex>

export default {
  title: 'Layout/wui-flex',
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
      options: alignItemsOptions,
      control: { type: 'select' }
    },
    justifyContent: {
      options: justifyContentOptions,
      control: { type: 'select' }
    },
    columnGap: {
      options: spacingOptions,
      control: { type: 'select' }
    },
    rowGap: {
      options: spacingOptions,
      control: { type: 'select' }
    },
    gap: {
      options: spacingOptions,
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
    >
      <wui-gallery-div size="sm" background="success-100"></wui-gallery-div>
      <wui-gallery-div size="lg" background="blue-100"></wui-gallery-div>
      <wui-gallery-div size="md" background="error-100"></wui-gallery-div>
    </wui-flex>`
}
