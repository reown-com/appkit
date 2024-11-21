/* eslint-disable no-bitwise */
import type { SpacingType, ThemeType, TruncateOptions } from './TypeUtil.js'

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

  formatCurrency(amount: number | string = 0, options: Intl.NumberFormatOptions = {}) {
    const numericAmount = Number(amount)

    if (isNaN(numericAmount)) {
      return '$0.00'
    }

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    })

    return formatter.format(numericAmount)
  },

  getHostName(url: string) {
    try {
      const newUrl = new URL(url)

      return newUrl.hostname
    } catch (error) {
      return ''
    }
  },

  getTruncateString({ string, charsStart, charsEnd, truncate }: TruncateOptions) {
    if (string.length <= charsStart + charsEnd) {
      return string
    }

    if (truncate === 'end') {
      return `${string.substring(0, charsStart)}...`
    } else if (truncate === 'start') {
      return `...${string.substring(string.length - charsEnd)}`
    }

    return `${string.substring(0, Math.floor(charsStart))}...${string.substring(
      string.length - Math.floor(charsEnd)
    )}`
  },

  generateAvatarColors(address: string) {
    const hash = address
      .toLowerCase()
      .replace(/^0x/iu, '')
      .replace(/[^a-f0-9]/gu, '')
    const baseColor = hash.substring(0, 6).padEnd(6, '0')
    const rgbColor = this.hexToRgb(baseColor)
    const masterBorderRadius = getComputedStyle(document.documentElement).getPropertyValue(
      '--w3m-border-radius-master'
    )
    const radius = Number(masterBorderRadius?.replace('px', ''))
    const edge = 100 - 3 * radius

    const gradientCircle = `${edge}% ${edge}% at 65% 40%`

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
    --local-radial-circle: ${gradientCircle}
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
  },
  splitBalance(input: string): [string, string] {
    const parts = input.split('.') as [string, string]
    if (parts.length === 2) {
      return [parts[0], parts[1]]
    }

    return ['0', '00']
  },
  roundNumber(number: number, threshold: number, fixed: number) {
    const roundedNumber =
      number.toString().length >= threshold ? Number(number).toFixed(fixed) : number

    return roundedNumber
  },
  /**
   * Format the given number or string to human readable numbers with the given number of decimals
   * @param value - The value to format. It could be a number or string. If it's a string, it will be parsed to a float then formatted.
   * @param decimals - number of decimals after dot
   * @returns
   */
  formatNumberToLocalString(value: string | number | undefined, decimals = 2) {
    if (value === undefined) {
      return '0.00'
    }

    if (typeof value === 'number') {
      return value.toLocaleString('en-US', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals
      })
    }

    return parseFloat(value).toLocaleString('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    })
  }
}
