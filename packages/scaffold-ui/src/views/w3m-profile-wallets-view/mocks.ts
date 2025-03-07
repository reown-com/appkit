const MOCK_INACTIVE_IMAGES = [
  {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=c1781fc385454899a2b1385a2b83df3b',
    walletName: 'Rainbow'
  },
  {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/a7f416de-aa03-4c5e-3280-ab49269aef00?projectId=c1781fc385454899a2b1385a2b83df3b',
    walletName: 'Ledger'
  },
  {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7e1514ba-932d-415d-1bdb-bccb6c2cbc00?projectId=c1781fc385454899a2b1385a2b83df3b',
    walletName: 'Fireblocks'
  }
] as const

const MOCK_ACTIVE_IMAGES = [
  {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=c1781fc385454899a2b1385a2b83df3b',
    walletName: 'Rainbow'
  }
] as const

const MOCK_INACTIVE_WALLET = {
  label: 'Wallet',
  alt: 'Wallet ',
  amount: 100,
  currency: 'USD',
  buttonLabel: 'Switch',
  buttonVariant: 'accent',
  totalNetworks: 2
} as const

const MOCK_ACTIVE_WALLET = {
  amount: 100,
  currency: 'USD',
  totalNetworks: 2,
  tagLabel: 'Active',
  tagVariant: 'success'
} as const

export const MOCK_INACTIVE_WALLETS = MOCK_INACTIVE_IMAGES.map(image => ({
  ...MOCK_INACTIVE_WALLET,
  buttonLabel: 'Connect',
  buttonVariant: 'neutral',
  imageSrc: image.src,
  label: image.walletName,
  alt: `Wallet ${image.walletName}`
}))

export const MOCK_ACTIVE_CONNECTIONS = MOCK_INACTIVE_IMAGES.slice(0, 2).map(image => ({
  ...MOCK_INACTIVE_WALLET,
  imageSrc: image.src,
  label: image.walletName,
  alt: `Wallet ${image.walletName}`
}))

export const MOCK_ACTIVE_WALLETS = MOCK_ACTIVE_IMAGES.map(image => ({
  ...MOCK_ACTIVE_WALLET,
  imageSrc: image.src,
  label: image.walletName,
  alt: `Wallet ${image.walletName}`
}))
