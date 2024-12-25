import { globalStyle } from '@vanilla-extract/css'

globalStyle('*', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
  fontFamily:
    'Inter, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif'
})

globalStyle('body', {
  background: '#202020'
})
