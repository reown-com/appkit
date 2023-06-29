import React from 'react'
import { Controls, Description, Primary, Source, Stories, Subtitle, Title } from '@storybook/blocks'
import { themes } from '@storybook/theming'

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

export default preview
