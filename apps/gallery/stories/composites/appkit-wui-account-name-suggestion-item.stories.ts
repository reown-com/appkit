import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-account-name-suggestion-item'
import type { WuiAccountNameSuggestionItem } from '@reown/appkit-ui/wui-account-name-suggestion-item'

import '../../components/gallery-container'

type Component = Meta<WuiAccountNameSuggestionItem>

export default {
  title: 'Composites/appkit-wui-account-name-suggestion-item',
  args: {
    name: 'alice.reown.id',
    registered: false,
    loading: false
  },
  argTypes: {
    registered: { control: { type: 'boolean' } },
    loading: { control: { type: 'boolean' } }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="336">
      <wui-account-name-suggestion-item
        name=${args.name}
        ?registered=${args.registered}
        ?loading=${args.loading}
      >
      </wui-account-name-suggestion-item>
    </gallery-container>`
}
