import { globalFontFace, globalStyle } from '@vanilla-extract/css'

globalFontFace('KHTeka', {
  fontDisplay: 'auto',
  fontStyle: 'normal',
  fontWeight: 500,
  src: "url('/assets/fonts/KHTeka-Medium.otf') format('opentype')"
})

globalFontFace('KHTekaMono', {
  fontDisplay: 'auto',
  fontStyle: 'normal',
  fontWeight: 400,
  src: "url('/assets/fonts/KHTekaMono-Regular.otf') format('opentype')"
})

globalFontFace('KHTeka', {
  fontDisplay: 'auto',
  fontStyle: 'normal',
  fontWeight: 400,
  src: "url('/assets/fonts/KHTeka-Regular.otf') format('opentype')"
})

globalFontFace('KHTeka', {
  fontDisplay: 'auto',
  fontStyle: 'normal',
  fontWeight: 300,
  src: "url('/assets/fonts/KHTeka-Light.otf') format('opentype')"
})

globalStyle('*', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
  fontFamily: 'KHTeka'
})

globalStyle('body', {
  background: '#202020'
})
