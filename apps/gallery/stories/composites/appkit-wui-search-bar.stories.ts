import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@laughingwhales/appkit-ui/wui-search-bar'
import type { WuiSearchBar } from '@laughingwhales/appkit-ui/wui-search-bar'

import '../../components/gallery-container'

type Component = Meta<WuiSearchBar>

export default {
  title: 'Composites/apkt-search-bar'
} as Component

export const Default: Component = {
  render: () =>
    html`<gallery-container width="336"><wui-search-bar></wui-search-bar></gallery-container>`
}
