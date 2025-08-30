// eslint-disable new-cap
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

/* eslint-disable new-cap */
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal'],
  display: 'swap'
})

export const domine = Domine({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal']
})

export const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal']
})

export const breeSerif = Bree_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal']
})

export const bellota = Bellota({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['normal']
})
export const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal']
})
/* eslint-enable new-cap */
