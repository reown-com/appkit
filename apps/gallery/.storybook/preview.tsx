import React from 'react'
import { Controls, Description, Primary, Source, Stories, Subtitle, Title } from '@storybook/blocks'
import { themes } from '@storybook/theming'
import { initDefaultTheme, setColorTheme } from '@web3modal/ui/src/utils/ThemeUtil'
import { addons } from '@storybook/preview-api'
import { GLOBALS_UPDATED, SET_GLOBALS } from '@storybook/core-events'

/** @type { import('@storybook/web-components').Preview } */
const preview = {
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
          <Source />
          <Controls />
          <Stories />
        </>
      )
    }
  }
}

let channel = addons.getChannel()

const backgroundListener = args => {
  const value = args.globals.backgrounds.value
  if (!value) {
    initDefaultTheme()
  } else {
    const theme = value === '#272A2A' ? 'dark' : 'light'
    setColorTheme(theme)
  }
}

function setupBackgroundListener() {
  channel.removeListener(SET_GLOBALS, backgroundListener)
  channel.addListener(SET_GLOBALS, backgroundListener)
  channel.removeListener(GLOBALS_UPDATED, backgroundListener)
  channel.addListener(GLOBALS_UPDATED, backgroundListener)
}

setupBackgroundListener()

export default preview
