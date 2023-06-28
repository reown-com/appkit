import React from 'react'
import { Controls, Description, Primary, Source, Stories, Subtitle, Title } from '@storybook/blocks'

import '../css/index.css'

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
    docs: {
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
