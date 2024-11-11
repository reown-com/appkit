export function generateRgbaColors({
  rgb,
  name,
  multiplier = 2,
  start = 1,
  end = 10
}: {
  rgb: string
  name: string
  multiplier?: number
  start?: number
  end?: number
}) {
  const length = end - start + 1
  const opacities = Array.from({ length }, (_, i) => (start + i) * 10)

  return Object.fromEntries(
    opacities.map(value => {
      const multiplied = value * multiplier
      const opacity = multiplied / 100
      const key = `${name}${multiplied.toString().padStart(3, '0')}`

      return [key, `rgba(${rgb}, ${opacity})`]
    })
  )
}

export const colors = {
  /* Main colors */
  black: '#202020',
  white: '#FFFFFF',

  /* Accent colors */
  ...generateRgbaColors({ name: 'accent', rgb: '9, 136, 240' }),
  ...generateRgbaColors({ name: 'accentSecondary', rgb: '199, 185, 148' }),

  /* Product colors */
  productWalletKit: '#FFB800',
  productAppKit: '#FF573B',
  productCloud: '#0988F0',
  productDocumentation: '#008847',

  /* Neutrals colors */
  neutrals050: '#F6F6F6',
  neutrals100: '#F3F3F3',
  neutrals200: '#E9E9E9',
  neutrals300: '#D0D0D0',
  neutrals400: '#BBB',
  neutrals500: '#9A9A9A',
  neutrals600: '#6C6C6C',
  neutrals700: '#4F4F4F',
  neutrals800: '#363636',
  neutrals900: '#2A2A2A',
  neutrals1000: '#252525',

  /* Semantic colors */
  ...generateRgbaColors({ name: 'semanticSuccess', rgb: '48, 164, 107' }),
  ...generateRgbaColors({ name: 'semanticError', rgb: '223, 74, 52' }),
  ...generateRgbaColors({ name: 'semanticWarning', rgb: '243, 161, 63' })
}

export const tokens = {
  core: {
    /* Background colors */
    backgroundAccentPrimary: '#0988F0',
    backgroundAccentCertified: '#C7B994',

    backgroundWalletKit: '#FFB800',
    backgroundAppKit: '#FF573B',
    backgroundCloud: '#0988F0',
    backgroundDocumentation: '#008847',

    backgroundSuccess: 'rgba(48, 164, 107, 0.20)',
    backgroundError: 'rgba(223, 74, 52, 0.20)',
    backgroundWarning: 'rgba(243, 161, 63, 0.20)',

    /* Text colors */
    textAccentPrimary: '#0988F0',
    textAccentCertified: '#C7B994',

    textWalletKit: '#FFB800',
    textAppKit: '#FF573B',
    textCloud: '#0988F0',
    textDocumentation: '#008847',

    textSuccess: '#30A46B',
    textError: '#DF4A34',
    textWarning: '#F3A13F',

    /* Border colors */
    borderAccentPrimary: '#0988F0',
    borderSecondary: '#C7B994',

    borderSuccess: '#30A46B',
    borderError: '#DF4A34',
    borderWarning: '#F3A13F',

    /* Foreground colors */
    ...generateRgbaColors({
      name: 'foregroundAccent',
      start: 1,
      multiplier: 2,
      end: 3,
      rgb: '9, 136, 240'
    }),
    ...generateRgbaColors({
      name: 'foregroundSecondary',
      start: 1,
      multiplier: 2,
      end: 3,
      rgb: '199, 185, 148'
    }),

    /* Icon colors */
    iconAccentPrimary: '#0988F0',
    iconAccentCertified: '#C7B994',

    iconSuccess: '#0988F0',
    iconError: '#DF4A34',
    iconWarning: '#F3A13F'
  },
  dark: {
    /* Background colors */
    backgroundPrimary: '#202020',
    backgroundInvert: '#FFFFFF',

    /* Text colors */
    textPrimary: '#FFFFFF',
    textSecondary: '#9A9A9A',
    textTertiary: '#BBBBBB',
    textInvert: '#363636',

    /* Border colors */
    borderPrimary: '#2A2A2A',
    borderSecondary: '#4F4F4F',

    /* Foreground colors */
    foregroundPrimary: '#2A2A2A',
    foregroundSecondary: '#363636',
    foregroundTertiary: '#4F4F4F',

    /* Icon colors */
    iconDefault: '#9A9A9A',
    iconInverse: '#FFFFFF'
  },
  light: {
    /* Background colors */
    backgroundPrimary: '#202020',
    backgroundInvert: '#FFFFFF',

    /* Text colors */
    textPrimary: '#202020',
    textSecondary: '#9A9A9A',
    textTertiary: '#6C6C6C',
    textInvert: '#FFFFFF',

    /* Border colors */
    borderPrimary: '#E9E9E9',
    borderSecondary: '#D0D0D0',

    /* Foreground colors */
    foregroundPrimary: '#F3F3F3',
    foregroundSecondary: '#E9E9E9',
    foregroundTertiary: '#D0D0D0',

    /* Icon colors */
    iconDefault: '#9A9A9A',
    iconInverse: '#202020'
  }
}

export const radii = {
  xs: '4px',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '32px',
  '80': '80px',
  '128': '128px',
  '256': '256px',
  '512': '512px',
  round: '999px'
}

export const spacing = {
  '2': '2px',
  '4': '4px',
  '8': '8px',
  '12': '12px',
  '16': '16px',
  '20': '20px',
  '24': '24px',
  '28': '28px',
  '32': '32px',
  '36': '36px',
  '40': '40px',
  '48': '48px',
  '56': '56px',
  '64': '64px',
  '80': '80px',
  '128': '128px',
  '256': '256px'
}
