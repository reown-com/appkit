/* eslint-disable no-bitwise */
import type { SpacingType, ThemeType, TruncateType } from './TypesUtil.js'

export const UiHelperUtil = {
  getSpacingStyles(spacing: SpacingType | SpacingType[], index: number) {
    if (Array.isArray(spacing)) {
      return spacing[index] ? `var(--wui-spacing-${spacing[index]})` : undefined
    } else if (typeof spacing === 'string') {
      return `var(--wui-spacing-${spacing})`
    }

    return undefined
  },

  getFormattedDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
  },

  getHostName(url: string) {
    const newUrl = new URL(url)

    return newUrl.hostname
  },

  getTruncateString(string: string, chars: number, truncate: TruncateType) {
    if (string.length <= chars) {
      return string
    }

    if (truncate === 'end') {
      return `${string.substring(0, chars)}...`
    } else if (truncate === 'start') {
      return `...${string.substring(string.length - chars)}`
    }

    return `${string.substring(0, Math.floor(chars / 2))}...${string.substring(
      string.length - Math.floor(chars / 2)
    )}`
  },

  generateAvatarColors(address: string) {
    const hash = address.toLowerCase().replace(/^0x/iu, '')
    const baseColor = hash.substring(0, 6)
    const rgbColor = this.hexToRgb(baseColor)

    const colors: string[] = []

    for (let i = 0; i < 5; i += 1) {
      const tintedColor = this.tintColor(rgbColor, 0.15 * i)
      colors.push(`rgb(${tintedColor[0]}, ${tintedColor[1]}, ${tintedColor[2]})`)
    }

    return `
    --local-color-1: ${colors[0]};
    --local-color-2: ${colors[1]};
    --local-color-3: ${colors[2]};
    --local-color-4: ${colors[3]};
    --local-color-5: ${colors[4]};
   `
  },

  hexToRgb(hex: string): [number, number, number] {
    const bigint = parseInt(hex, 16)

    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    return [r, g, b]
  },

  tintColor(rgb: [number, number, number], tint: number): [number, number, number] {
    const [r, g, b] = rgb
    const tintedR = Math.round(r + (255 - r) * tint)
    const tintedG = Math.round(g + (255 - g) * tint)
    const tintedB = Math.round(b + (255 - b) * tint)

    return [tintedR, tintedG, tintedB]
  },

  isNumber(character: string) {
    const regex = {
      number: /^[0-9]+$/u
    }

    return regex.number.test(character)
  },

  getColorTheme(theme: ThemeType | undefined) {
    if (theme) {
      return theme
    } else if (typeof window !== 'undefined' && window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }

      return 'light'
    }

    return 'dark'
  }
}
