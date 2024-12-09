import {
  Noto_Sans,
  Inter,
  Domine,
  EB_Garamond,
  Bree_Serif,
  Teko,
  Bellota,
  Delius,
  Agbalumo
} from 'next/font/google'
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

export const newAmsterdam = localFont({
  src: [{ path: '../app/fonts/NewAmsterdam-Regular.ttf', weight: '400', style: 'normal' }]
})

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal']
})

export const domine = Domine({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal']
})

export const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal']
})

export const breeSerif = Bree_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal']
})

export const teko = Teko({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal']
})

export const bellota = Bellota({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal']
})

export const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal']
})

export const delius = Delius({
  subsets: ['latin'],
  weight: '400'
})

export const agbalumo = Agbalumo({
  subsets: ['latin'],
  weight: '400'
})
