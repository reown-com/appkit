export const colors = [
  '#3da5ff',
  '#00b9a8',
  '#83f3b8',
  '#74dc2e',
  '#afbf8d',
  '#ffe272',
  '#f1d299',
  '#986a33',
  '#ff9351',
  '#eba39c',
  '#ff3737',
  '#a72626',
  '#ff74bc',
  '#bf51e0',
  '#414796'
]

export type SdkOption = {
  title: string
  link: string
  links?: {
    title: string
    url: string
  }[]
  description: string
  randomLinks?: string[]
}

export const vitalikEthAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'

export const wagmiSdkOptions: SdkOption[] = [
  {
    title: 'Default',
    link: '/appkit?name=wagmi',
    description: 'Basic configuration using wagmi as a driving library'
  },
  {
    title: 'SIWE',
    link: '/appkit?name=wagmi-all',
    description: 'Configuration using wagmi and implementing sign in with ethereum'
  },
  {
    title: 'Without Email',
    link: '/appkit?name=wagmi-no-email',
    description: 'Configuration using wagmi without email'
  },
  {
    title: 'Without Socials',
    link: '/appkit?name=wagmi-no-socials',
    description: 'Configuration using wagmi without socials'
  },
  {
    title: 'Permissions(Sync)',
    link: '/appkit?name=wagmi-permissions-sync',
    description: 'Configuration using wagmi and implementing ERC-7715 with passkey'
  },
  {
    title: 'Permissions(Async)',
    link: '/appkit?name=wagmi-permissions-async',
    description: 'Configuration using wagmi and implementing ERC-7715 with ecdsa key'
  }
]

export const ethersSdkOptions: SdkOption[] = [
  {
    title: 'Default',
    link: '/appkit?name=ethers',
    description: 'Basic configuration using ethers as a driving library'
  },
  {
    title: 'SIWE',
    link: '/appkit?name=ethers-all',
    description: 'Configuration using ethers and implementing sign in with ethereum'
  },
  {
    title: 'Without Email',
    link: '/appkit?name=ethers-no-email',
    description: 'Configuration using ethers without email'
  },
  {
    title: 'Without Socials',
    link: '/appkit?name=ethers-no-socials',
    description: 'Configuration using ethers without socials'
  }
]

export const ethers5SdkOptions: SdkOption[] = [
  {
    title: 'Default',
    link: '/appkit?name=ethers5',
    description: 'Basic configuration using ethers as a driving library'
  },
  {
    title: 'SIWE',
    link: '/appkit?name=ethers5-all',
    description: 'Configuration using ethers and implementing sign in with ethereum'
  },
  {
    title: 'Without Socials',
    link: '/appkit?name=ethers5-no-socials',
    description: 'Configuration using ethers without socials'
  }
]

export const solanaSdkOptions: SdkOption[] = [
  {
    title: 'Default',
    link: '/appkit?name=solana',
    description: 'Basic configuration using solana as a driving library'
  },
  {
    title: 'Without Email',
    link: '/appkit?name=solana-no-email',
    description: 'Configuration using solana without email'
  },
  {
    title: 'Without Socials',
    link: '/appkit?name=solana-no-socials',
    description: 'Configuration using ethers without socials'
  }
]

export const multichainSdkOptions: SdkOption[] = [
  {
    title: 'Wagmi + Solana + Bitcoin',
    link: '/appkit?name=multichain-all',
    description: 'Configuration with Wagmi, Solana and Bitcoin adapters enabled for AppKit'
  },
  {
    title: 'Wagmi + Solana',
    link: '/appkit?name=multichain-wagmi-solana',
    description: 'Configuration with Wagmi and Solana adapters enabled for AppKit'
  },
  {
    title: 'Wagmi + Bitcoin',
    link: '/appkit?name=multichain-wagmi-bitcoin',
    description: 'Configuration with Wagmi and Bitcoin adapters enabled for AppKit'
  },
  {
    title: 'Ethers + Solana',
    link: '/appkit?name=multichain-ethers-solana',
    description: 'Configuration with Ethers and Solana adapters enabled for AppKit'
  },
  {
    title: 'Ethers5 + Solana',
    link: '/appkit?name=multichain-ethers5-solana',
    description: 'Configuration with Ethers 5 and Solana adapters enabled for AppKit'
  },
  {
    title: 'Basic',
    link: '/appkit?name=multichain-no-adapters',
    description: 'Configuration with no adapters enabled for AppKit'
  }
]

export const testingSdkOptions: SdkOption[] = [
  {
    title: 'Demo',
    link: '',
    description: 'All features enabled and randomly using ethers or wagmi',
    randomLinks: ['/appkit?name=wagmi-all', '/appkit?name=ethers-all']
  },
  {
    title: 'Demo w/ Sample Wallets',
    link: '',
    description:
      'All features enabled, with sample wallet links, and randomly using ethers or wagmi',
    randomLinks: ['/appkit?name=wagmi-all-internal', '/appkit?name=ethers-all-internal']
  },
  {
    title: 'Demo w/ Universal Links',
    link: '/appkit?name=universal-links',
    description:
      'All features enabled, and using universal links over deep links for mobile wallets'
  }
]

export const featuredSdkOptions: SdkOption[] = [
  {
    title: 'Default',
    link: '/appkit?name=wagmi',
    description: 'Basic configuration using wagmi as a driving library'
  },
  {
    title: 'Multichain',
    link: '/appkit?name=multichain-all',
    description: 'Configuration with Wagmi, Solana and Bitcoin adapters enabled for AppKit'
  },
  {
    title: 'Basic',
    link: '/appkit?name=multichain-no-adapters',
    description: 'Configuration with no adapters enabled for AppKit'
  }
]

export const bitcoinSdkOptions: SdkOption[] = [
  {
    title: 'Default',
    link: '/appkit?name=bitcoin',
    description: 'Basic configuration using bitcoin as a driving library'
  }
]

export const tonSdkOptions: SdkOption[] = [
  {
    title: 'Default',
    link: '/appkit?name=ton',
    description: 'Basic configuration using Ton as a driving library'
  }
]

export const siwxSdkOptions: SdkOption[] = [
  {
    title: 'Reown Authentication',
    link: '/appkit?name=reown-authentication',
    description: 'SIWX configuration using Reown Authentication'
  },
  {
    title: 'Default SIWX',
    link: '/appkit?name=siwx-default',
    description:
      'Multichain SIWX configuration with Ethers, Solana and Bitcoin adapters enabled for AppKit'
  }
]

export const paySdkOptions: SdkOption[] = [
  {
    title: 'Default',
    link: '/appkit?name=pay-default',
    description: 'AppKit Pay with default configuration'
  }
]

export const customSdkOptions: SdkOption[] = [
  {
    title: 'Exclude Wallet IDs',
    link: '/appkit?name=flag-exclude-wallet-ids',
    description: 'AppKit configuration with excluded wallet IDs enabled for Backpack'
  },
  {
    title: 'Enable Reconnect (disabled)',
    link: '/appkit?name=flag-enable-reconnect-wagmi',
    links: [
      {
        title: 'Wagmi',
        url: '/appkit?name=flag-enable-reconnect-wagmi'
      },
      {
        title: 'Ethers',
        url: '/appkit?name=flag-enable-reconnect-ethers'
      },
      {
        title: 'Ethers5',
        url: '/appkit?name=flag-enable-reconnect-ethers5'
      }
    ],
    description:
      'AppKit configuration with `enableReconnect` flag set to false to disable reconnect on page load'
  }
]
