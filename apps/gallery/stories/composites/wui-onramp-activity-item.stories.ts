import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-onramp-activity-item'
import type { WuiOnRampActivityItem } from '@web3modal/ui/src/composites/wui-onramp-activity-item'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiOnRampActivityItem>

export default {
  title: 'Composites/wui-onramp-activity-item',
  args: {
    completed: true,
    inProgress: false,
    failed: false,
    purchaseCurrency: 'USD',
    purchaseValue: '1000',
    date: '2 days ago'
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="340">
      <wui-onramp-activity-item
        label="Bought"
        .completed=${args.completed}
        .inProgress=${args.inProgress}
        .failed=${args.failed}
        purchaseCurrency=${args.purchaseCurrency}
        purchaseValue=${args.purchaseValue}
        date=${args.date}
      ></wui-onramp-activity-item>
    </gallery-container>
  `
}
