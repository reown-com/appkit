import { svg } from 'lit'

/*
 * Zorbs by Zora
 * https://github.com/ourzora/zorb/blob/main/packages/zorb-web-component/src
 */

function getBackgroundColor(address: string) {
  function hashCode(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i += 1) {
      // eslint-disable-next-line no-bitwise
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    return hash
  }

  const uniqueHashCode = hashCode(address)
  const gradient = [
    { h: uniqueHashCode % 360, s: 83, l: 93 },
    { h: uniqueHashCode % 360, s: 87, l: 82 },
    { h: uniqueHashCode % 360, s: 91, l: 72 },
    { h: uniqueHashCode % 360, s: 93, l: 68 },
    { h: uniqueHashCode % 360, s: 93, l: 68 }
  ]

  return gradient.map(input => `hsl(${Math.round(input.h)}, ${input.s}%, ${input.l}%)`)
}

export function zorbSVG(address: string, size: number) {
  const gradientInfo = getBackgroundColor(address)

  return svg`
    <svg width="${size}" height="${size}" viewBox="0 0 110 110">
      <defs>
        <radialGradient
          id="gzr"
          gradientTransform="translate(66.4578 24.3575) scale(75.2908)"
          gradientUnits="userSpaceOnUse"
          r="1"
          cx="0"
          cy="0%"
        >
          <stop offset="15.62%" stop-color="${gradientInfo[0]}" />
          <stop offset="39.58%" stop-color="${gradientInfo[1]}" />
          <stop offset="72.92%" stop-color="${gradientInfo[2]}" />
          <stop offset="90.63%" stop-color="${gradientInfo[3]}" />
          <stop offset="100%" stop-color="${gradientInfo[4]}" />
        </radialGradient>
      </defs>
      <g transform="translate(5,5)">
        <path
          d="M100 50C100 22.3858 77.6142 0 50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100C77.6142 100 100 77.6142 100 50Z"
          fill="url(#gzr)"
        />
        <path
          stroke="rgba(0,0,0,0.075)"
          fill="transparent"
          stroke-width="1"
          d="M50,0.5c27.3,0,49.5,22.2,49.5,49.5S77.3,99.5,50,99.5S0.5,77.3,0.5,50S22.7,0.5,50,0.5z"
        />
        <circle cx="50" cy="50" r="49.5" stroke="#fff" stroke-width="5" fill="none" />
      </g>
    </svg>
  `
}
