import { create } from 'zustand'

interface ThemeVariables {
  '--w3m-font-family'?: string
  '--w3m-accent'?: string
  '--w3m-color-mix'?: string
  '--w3m-color-mix-strength'?: number
  '--w3m-font-size-master'?: string
  '--w3m-border-radius-master'?: string
  '--w3m-z-index'?: string
}

interface ThemeStoreState {
  mixColorStrength: number
  setMixColorStrength: (value: number) => void
  mixColor?: string
  setMixColor: (value: string) => void
  accentColor?: string
  setAccentColor: (value: string) => void
  themeVariables: ThemeVariables
  setThemeVariables: (value: ThemeVariables) => void
}

const useThemeStore = create<ThemeStoreState>(set => ({
  mixColorStrength: 0,
  setMixColorStrength: value => set(() => ({ mixColorStrength: value })),
  mixColor: undefined,
  setMixColor: value => set(() => ({ mixColor: value })),
  accentColor: undefined,
  setAccentColor: value => set(() => ({ accentColor: value })),
  themeVariables: {},
  setThemeVariables: value => set(() => ({ themeVariables: value }))
}))

export default useThemeStore
