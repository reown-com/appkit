interface MobileWallet {
  id: string
  links: {
    universal: string
    deep?: string
  }
}

interface DesktopWallet {
  id: string
  links: {
    deep: string
    universal: string
  }
}

export interface Settings {
  projectId?: string
  theme?: 'dark' | 'light'
  accentColor?:
    | 'blackWhite'
    | 'blue'
    | 'default'
    | 'green'
    | 'magenta'
    | 'orange'
    | 'purple'
    | 'teal'
  standaloneChains?: string[]
  mobileWallets?: MobileWallet[]
  desktopWallets?: DesktopWallet[]
  walletImages?: Record<string, string>
  chainImages?: Record<string, string>
}
