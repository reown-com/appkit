// -- Types ------------------------------------------------------------------
export type ThemeType = 'dark' | 'light'

export interface ThemeVariables {
  '--w3m-font-family'?: string
  '--w3m-accent'?: string
  '--w3m-color-mix'?: string
  '--w3m-color-mix-strength'?: number
  '--w3m-font-size-master'?: string
  '--w3m-border-radius-master'?: string
  '--w3m-z-index'?: number
}

export interface W3mThemeVariables {
  '--w3m-accent': string
  '--w3m-background': string
}

// -- Utilities ---------------------------------------------------------------
export function getW3mThemeVariables(themeVariables?: ThemeVariables, themeType?: ThemeType) {
  if (themeType === 'light') {
    return {
      '--w3m-accent': themeVariables?.['--w3m-accent'] || 'hsla(231, 100%, 70%, 1)',
      '--w3m-background': '#fff'
    }
  }

  return {
    '--w3m-accent': themeVariables?.['--w3m-accent'] || 'hsla(230, 100%, 67%, 1)',
    '--w3m-background': '#121313'
  }
}
