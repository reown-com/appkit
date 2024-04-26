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
  if (themeType === 'dark') {
    return {
      '--w3m-accent': themeVariables?.['--w3m-accent'] || '#5773ff',
      '--w3m-background': '#fff'
    }
  }

  return {
    '--w3m-accent': themeVariables?.['--w3m-accent'] || '#667dff',
    '--w3m-background': '#121313'
  }
}
