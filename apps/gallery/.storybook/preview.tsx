import React from 'react'
import { Controls, Description, Primary, Source, Stories, Subtitle, Title } from '@storybook/blocks'
import { themes } from '@storybook/theming'
import { setColorTheme, initializeTheming } from '@web3modal/ui/src/utils/ThemeUtil'
import { addons } from '@storybook/preview-api'
import { GLOBALS_UPDATED, SET_GLOBALS } from '@storybook/core-events'

// -- Utilities ------------------------------------------------------------
initializeTheming()

const backgroundChangeListener = args => {
  const bgColor = args.globals.backgrounds?.value
  if (bgColor) {
    const theme = bgColor === '#272A2A' ? 'dark' : 'light'
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
          value: '#272A2A'
        },
        {
          name: 'light',
          value: '#EAF1F1'
        }
      ]
    },

    docs: {
      theme: themes.dark,
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Source dark />
          <Controls />
        </>
      )
    }
  }
}
