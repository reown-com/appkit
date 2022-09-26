/* eslint-disable func-style */
import { arrayify } from 'ethers/lib/utils'
import { svg } from 'lit'

/*
 * Zorbs by Zora.
 * Adapted from: https://github.com/ourzora/zorb/blob/main/packages/zorb-web-component/src
 * https://github.com/ensdomains/ens-app-v3/blob/dev/src/utils/gradient.ts
 */

interface HSL {
  h: number
  s: number
  l: number
}

const linear = (p: number) => p

const cubicInOut = (p: number) => {
  const m = p - 1
  const t = p * 2
  if (t < 1) return p * t * t

  return 1 + m * m * m * 4
}

const cubicIn = (p: number) => {
  return p * p * p
}

const quintIn = (p: number) => {
  return p * p * p * p * p
}

const bscale = (byte: number, max: number) => Math.round((byte / 255) * max)

// Util for keeping hue range in 0-360 positive
const clampHue = (h: number) => {
  if (h >= 0) return h % 360.0

  return 360 + (h % 360)
}

// Scale byte in range min and max
const bScaleRange = (byte: number, min: number, max: number) => {
  return bscale(byte, max - min) + min
}

export const lerpHueFn = (optionNum: number, direction: number) => {
  const option = optionNum % 4
  const multiplier = direction ? 1 : -1
  switch (option) {
    case 0: {
      return (hue: number, pct: number) => {
        const endHue = hue + multiplier * 10

        return clampHue(linear(1.0 - pct) * hue + linear(pct) * endHue)
      }
    }
    case 1: {
      return (hue: number, pct: number) => {
        const endHue = hue + multiplier * 30

        return clampHue(linear(1.0 - pct) * hue + linear(pct) * endHue)
      }
    }
    case 2: {
      return (hue: number, pct: number) => {
        const endHue = hue + multiplier * 50
        const lerpPercent = cubicInOut(pct)

        return clampHue(linear(1.0 - lerpPercent) * hue + lerpPercent * endHue)
      }
    }
    case 3:
    default: {
      return (hue: number, pct: number) => {
        const endHue = hue + multiplier * 60 * bscale(optionNum, 1.0) + 30
        const lerpPercent = cubicInOut(pct)

        return clampHue((1.0 - lerpPercent) * hue + lerpPercent * endHue)
      }
    }
  }
}

const lerpLightnessFn = (optionNum: number) => {
  switch (optionNum) {
    case 0: {
      return (start: number, end: number, pct: number) => {
        const lerpPercent = quintIn(pct)

        return (1.0 - lerpPercent) * start + lerpPercent * end
      }
    }
    case 1:
    default: {
      return (start: number, end: number, pct: number) => {
        const lerpPercent = cubicIn(pct)

        return (1.0 - lerpPercent) * start + lerpPercent * end
      }
    }
  }
}

const lerpSaturationFn = (optionNum: number) => {
  switch (optionNum) {
    case 0: {
      return (start: number, end: number, pct: number) => {
        const lerpPercent = quintIn(pct)

        return (1.0 - lerpPercent) * start + lerpPercent * end
      }
    }
    case 1:
    default: {
      return (start: number, end: number, pct: number) => {
        const lerpPercent = linear(pct)

        return (1.0 - lerpPercent) * start + lerpPercent * end
      }
    }
  }
}

export const gradientForBytes = (address: string) => {
  const bytes = arrayify(
    address === '' ? '0x0000000000000000000000000000000000000000' : address
  ).reverse()
  const hueShiftFn = lerpHueFn(bytes[3], bytes[6] % 2)
  const startHue = bscale(bytes[12], 360)
  const startLightness = bScaleRange(bytes[2], 32, 69.5)
  const endLightness = (97 + bScaleRange(bytes[8], 72, 97)) / 2
  const startSaturation = bScaleRange(bytes[7], 81, 97)
  const endSaturation = Math.min(startSaturation - 10, bScaleRange(bytes[10], 70, 92))

  const lightnessShiftFn = lerpLightnessFn(bytes[5] % 2)
  const saturationShiftFn = lerpSaturationFn(bytes[3] % 2)
  const inputs: HSL[] = [
    {
      h: hueShiftFn(startHue, 0),
      s: saturationShiftFn(startSaturation, endSaturation, 1),
      l: lightnessShiftFn(startLightness, endLightness, 1)
    },
    {
      h: hueShiftFn(startHue, 0.1),
      s: saturationShiftFn(startSaturation, endSaturation, 0.9),
      l: lightnessShiftFn(startLightness, endLightness, 0.9)
    },
    {
      h: hueShiftFn(startHue, 0.7),
      s: saturationShiftFn(startSaturation, endSaturation, 0.7),
      l: lightnessShiftFn(startLightness, endLightness, 0.7)
    },
    {
      h: hueShiftFn(startHue, 0.9),
      s: saturationShiftFn(startSaturation, endSaturation, 0.2),
      l: lightnessShiftFn(startLightness, endLightness, 0.2)
    },
    {
      h: hueShiftFn(startHue, 1),
      s: saturationShiftFn(startSaturation, endSaturation, 0),
      l: startLightness
    }
  ]

  return inputs.map(
    (input: HSL) => `hsl(${Math.round(input.h)}, ${Math.round(input.s)}%, ${Math.round(input.l)}%)`
  )
}

export const zorbImageSVG = (address: string, size: string) => {
  const gradientInfo = gradientForBytes(address)

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
