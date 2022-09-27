/* eslint-disable func-style */
import { svg } from 'lit'

/*
 * Zorbs by Zora.
 * Adapted from:
 * https://github.com/ourzora/zorb/blob/main/packages/zorb-web-component/src
 * Made more lightweight by settings the Saturation and Lightness to defaults.
 * Chnaged Hue according to one hashcode of the address
 */

interface HSL {
  h: number
  s: number
  l: number
}

export const getBackgroundColor = (address: string) => {
  const hashCode = (str: string) => {
    let hash = 0
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < str.length; i++)
      // eslint-disable-next-line no-bitwise
      hash = str.charCodeAt(i) + ((hash << 5) - hash)

    return hash
  }

  const uniqueHashCode = hashCode(address)

  const gradient: HSL[] = [
    {
      h: uniqueHashCode % 360,
      s: 83,
      l: 93
    },
    {
      h: uniqueHashCode % 360,
      s: 87,
      l: 82
    },
    {
      h: uniqueHashCode % 360,
      s: 91,
      l: 72
    },
    {
      h: uniqueHashCode % 360,
      s: 93,
      l: 68
    },
    {
      h: uniqueHashCode % 360,
      s: 93,
      l: 68
    }
  ]

  return gradient.map((input: HSL) => `hsl(${Math.round(input.h)}, ${input.s}%, ${input.l}%)`)
}

export const zorbImageSVG = (address: string, size: string) => {
  const gradientInfo = getBackgroundColor(address)

  return svg`
  <svg width="${size}" height="${size}" viewBox="0 0 110 110">
  <defs>
      <linearGradient id="gzr" x1="106.975" y1="136.156" x2="-12.9815" y2="13.5347" gradientUnits="userSpaceOnUse">
        gradientTransform="translate(131.638 129.835) rotate(-141.194) scale(185.582)">
        <stop offset="0.1562" stop-color="${gradientInfo[0]}" />
        <stop offset="0.3958" stop-color="${gradientInfo[1]}" />
        <stop offset="0.7292" stop-color="${gradientInfo[2]}" />
        <stop offset="0.9063" stop-color="${gradientInfo[3]}" />
        <stop offset="1" stop-color="${gradientInfo[4]}" />
      </linearGradient>
    </defs>
    <path
      d="M110 55C110 24.6244 85.3756 0 55 0C24.6244 0 0 24.6244 0 55C0 85.3756 24.6244 110 55 110C85.3756 110 110 85.3756 110 55Z"
      fill="url(#gzr)" />
  </svg>
    `
}
