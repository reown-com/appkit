import type { Meta } from '@storybook/web-components'
import { useState } from 'storybook/preview-api'

import { html } from 'lit'

import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-card'
import '@reown/appkit-ui/wui-router-container'
import '@reown/appkit-ui/wui-shimmer'

import { Page1, Page2 } from './appkit-wui-router-container.components'

const DEFAULT_VALUE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const transitionFunctions = [
  {
    name: 'easeOutSine',
    value: 'cubic-bezier(0.61, 1, 0.88, 1)'
  },
  {
    name: 'easeOutCubic',
    value: 'cubic-bezier(0.33, 1, 0.68, 1)'
  },
  {
    name: 'easeOutQuint',
    value: 'cubic-bezier(0.22, 1, 0.36, 1)'
  },
  {
    name: 'easeOutCirc',
    value: 'cubic-bezier(0, 0.55, 0.45, 1)'
  },
  {
    name: 'easeOutExpo',
    value: 'cubic-bezier(0.19, 1, 0.22, 1)'
  },
  {
    name: 'easeOutQuad',
    value: 'cubic-bezier(0.5, 1, 0.89, 1)'
  },
  {
    name: 'easeOutBack',
    value: 'cubic-bezier(0.36, 0, 0.66, -0.56)'
  }
]

type Component = Meta<{
  transitionDuration: string
  transitionFunction: string
}>

export default {
  title: 'Composites/appkit-wui-router-container',
  args: {
    transitionDuration: '0.2s',
    transitionFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  argTypes: {
    transitionDuration: {
      options: ['0.1s', '0.15s', '0.2s', '0.25s', '0.3s', '0.4s'],
      control: { type: 'select' }
    },
    transitionFunction: {
      options: transitionFunctions.map(t => t.name),
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => {
    const [view, setView] = useState<string>('page1')
    const [history, setHistory] = useState<string[]>(['page1'])

    function onRenderPages(view: string) {
      if (view === 'page1') {
        return Page1()
      } else {
        return Page2()
      }
    }

    const transitionFunc =
      transitionFunctions.find(t => t.name === args.transitionFunction)?.value || DEFAULT_VALUE

    return html`
      <div
        style="display: flex; flex-direction: row; align-items: flex-start; gap: 16px; height: 100vh;"
      >
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <wui-button
            size="sm"
            .disabled=${view === 'page1'}
            @click="${() => {
              const previousPage = history[history.length - 2]
              if (previousPage) {
                setView(previousPage)
                setHistory(history.slice(0, -1))
              }
            }}"
          >
            Go prev page
            <wui-icon slot="iconLeft" name="arrowLeft"></wui-icon>
          </wui-button>
          <wui-button
            size="sm"
            .disabled=${view === 'page2'}
            @click="${() => {
              setView('page2')
              setHistory([...history, 'page2'])
            }}"
          >
            Go next page
            <wui-icon slot="iconRight" name="arrowRight"></wui-icon>
          </wui-button>
          <wui-button
            size="sm"
            @click="${() => {
              setView('page1')
              setHistory(['page1'])
            }}"
          >
            Reset History
            <wui-icon slot="iconLeft" name="clock"></wui-icon>
          </wui-button>
        </div>

        <wui-card
          style="border-radius: var(--apkt-borderRadius-4); overflow: hidden; border: 1px solid var(--apkt-tokens-theme-borderPrimary); "
        >
          <wui-flex
            width="100%"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            padding="4"
          >
            <wui-icon name="questionMark" color="inverse"></wui-icon>
            <wui-text variant="lg-medium" color="primary">Connect</wui-text>
            <wui-icon name="close" color="inverse"></wui-icon>
          </wui-flex>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <wui-router-container
              transitionDuration="${args.transitionDuration}"
              transitionFunction="${transitionFunc}"
              .history=${history}
              view="${view}"
              .onRenderPages=${onRenderPages}
            ></wui-router-container>
          </div>
        </wui-card>
      </div>
    `
  }
}
