import { Bellota, Bree_Serif, Domine, EB_Garamond, Inter, Noto_Sans } from 'next/font/google'
import localFont from 'next/font/local'

export const khTeka = localFont({
  src: [
    {
      path: '../app/fonts/KHTeka-Light.woff',
      weight: '300',
      style: 'normal'
    },
    {
      path: '../app/fonts/KHTeka-Regular.woff',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../app/fonts/KHTeka-Medium.woff',
      weight: '500',
      style: 'normal'
    },
    {
      path: '../app/fonts/KHTekaMono-Regular.woff',
      weight: '700',
      style: 'mono'
    }
  ]
})
