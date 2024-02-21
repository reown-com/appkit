const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

export const ConstantsUtil = {
  SigningSucceededToastTitle: 'Signing Succeeded',
  SigningFailedToastTitle: 'Signing Failed',
  TestIdSiweAuthenticationStatus: 'w3m-authentication-status',
  Metadata: {
    name: 'Web3Modal',
    description: 'Web3Modal Laboratory',
    url: 'https://lab.web3modal.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
    verifyUrl: ''
  },
  CustomWallets: [
    {
      id: 'react-wallet-v2',
      name: 'react-wallet-v2',
      homepage: 'https://react-wallet.walletconnect.com',
      mobile_link: 'https://react-wallet.walletconnect.com',
      desktop_link: 'https://react-wallet.walletconnect.com',
      webapp_link: 'https://react-wallet.walletconnect.com'
    }
  ],
  ProjectId: projectId
}
