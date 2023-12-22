import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-list-accordion'
import type { WuiListAccordion } from '@web3modal/ui/src/composites/wui-list-accordion'
import { html } from 'lit'
import '../../components/gallery-container'
import { signTypedData } from '../../utils/PresetUtils'

type Component = Meta<WuiListAccordion>

export default {
  title: 'Composites/wui-list-accordion',
  args: {
    textTitle: 'Message',
    overflowedContent: JSON.stringify(signTypedData, null, 2)
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-accordion
        textTitle=${args.textTitle}
        overflowedContent=${args.overflowedContent}
      ></wui-list-accordion>
    </gallery-container>`
}
