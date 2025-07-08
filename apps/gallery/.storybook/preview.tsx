import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'

import { initializeTheming, setColorTheme } from '@reown/appkit-ui'

// -- Utilities ------------------------------------------------------------
initializeTheming({})

const backgroundChangeListener = args => {
  const bgColor = args.globals.backgrounds?.value
  if (bgColor) {
    const theme = bgColor === '#202020' ? 'dark' : 'light'
    setColorTheme(theme)
  } else {
    setColorTheme('dark')
  }
}

const channel = addons.getChannel()
channel.addListener(SET_GLOBALS, backgroundChangeListener)
channel.addListener(GLOBALS_UPDATED, backgroundChangeListener)

// -- Configuration --------------------------------------------------------
/** @type { import('@storybook/web-components').Preview } */
export default {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#202020'
        },
        {
          name: 'light',
          value: '#FFFFFF'
        }
      ]
    }
  }
}
