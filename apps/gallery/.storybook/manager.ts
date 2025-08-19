import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

// @ts-expect-error
import logo from '../assets/logo.png'

const theme = create({
  base: 'dark',
  brandTitle: 'Reown',
  brandUrl: 'https://reown.com',
  brandImage: logo,
  brandTarget: '_blank',

  fontBase:
    'KHTekaMono, Inter, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;',
  fontCode: 'monospace',

  colorPrimary: '#FFFFFF',
  colorSecondary: '#9A9A9A',

  appBg: '#202020',
  appContentBg: '#252525',
  appBorderColor: '#2A2A2A',

  textColor: '#FFFFFF',
  textInverseColor: '#9A9A9A',

  barTextColor: '#FFFFFF',
  barSelectedColor: '#FFFFFF',
  barHoverColor: '#FFFFFF',
  barBg: '#252525',

  inputBg: '#202020',
  inputBorder: '#2A2A2A',
  inputTextColor: '#9A9A9A',
  inputBorderRadius: 16
})

addons.setConfig({
  theme
})
