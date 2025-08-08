import type { Meta } from '@storybook/web-components'
import { useState } from 'storybook/preview-api'

import { html } from 'lit'

import '@reown/appkit-scaffold-ui/partials/w3m-router-container'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-card'
import '@reown/appkit-ui/wui-shimmer'

import { connectPage, connectingPage, settingsPage } from './w3m-router-container.components.js'

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
  title: 'Partials/w3m-router-container',
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

const pages = [
  {
    name: 'ConnectView',
    component: connectPage
  },
  {
    name: 'ConnectingView',
    component: connectingPage
  },
  {
    name: 'SettingsView',
    component: settingsPage
  }
]

const intialPage = 'ConnectView'

export const Default: Component = {
  render: args => {
    const [history, setHistory] = useState<string[]>([intialPage])
    const [currentView, setCurrentView] = useState<string | undefined>(intialPage)

    function onRenderPages() {
      switch (currentView) {
        case 'ConnectView':
          return connectPage()
        case 'ConnectingView':
          return connectingPage()
        case 'SettingsView':
          return settingsPage()
        default:
          return html``
      }
    }

    function setView(view: string) {
      setCurrentView(view)
      if (view === 'ConnectingView') {
        document.documentElement.style.setProperty('--apkt-footer-height', '80px')
      } else {
        document.documentElement.style.setProperty('--apkt-footer-height', '0px')
      }
    }

    const transitionFunc =
      transitionFunctions.find(t => t.name === args.transitionFunction)?.value || DEFAULT_VALUE
    const prevDisabled = history.length < 2
    const nextDisabled = history.length === pages.length

    return html`
      <div
        style="display: flex; flex-direction: row; align-items: flex-start; gap: 16px; height: 100vh;"
      >
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <wui-button
            size="sm"
            .disabled=${prevDisabled}
            @click="${() => {
              if (history.length > 1) {
                const previousPage = history[history.length - 2]
                if (previousPage) {
                  setHistory(history.slice(0, -1))
                }
              }
            }}"
          >
            Go prev page
            <wui-icon slot="iconLeft" name="arrowLeft"></wui-icon>
          </wui-button>
          <wui-button
            size="sm"
            .disabled=${nextDisabled}
            @click="${() => {
              if (history.length < pages.length) {
                setHistory([...history, pages[history.length]?.name || ''])
              }
            }}"
          >
            Go next page
            <wui-icon slot="iconRight" name="arrowRight"></wui-icon>
          </wui-button>
          <wui-button
            size="sm"
            @click="${() => {
              setHistory(['ConnectView'])
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
          <div style="display: flex; flex-direction: column; gap: 8px; width: 370px;">
            <w3m-router-container
              transitionDuration="${args.transitionDuration}"
              transitionFunction="${transitionFunc}"
              history=${history.join(',')}
              .setView=${setView}
            >
              ${onRenderPages()}
            </w3m-router-container>
          </div>
        </wui-card>
      </div>
    `
  }
}
