export const defaultAccountState = {
  allAccounts: [],
  address: undefined,
  caipAddress: undefined,
  isConnected: false,
  status: undefined,
  embeddedWalletInfo: undefined
}

export const connectedAccountState = {
  allAccounts: [],
  address: '0x123...',
  caipAddress: 'eip155:1:0x123...',
  isConnected: true,
  status: 'connected',
  embeddedWalletInfo: undefined
}

export const disconnectedAccountState = {
  allAccounts: [],
  address: undefined,
  caipAddress: undefined,
  isConnected: false,
  status: 'disconnected',
  embeddedWalletInfo: undefined
}

export const connectedWithEmbeddedWalletState = {
  allAccounts: [],
  address: '0x123...',
  caipAddress: 'eip155:1:0x123...',
  isConnected: true,
  status: 'connected',
  embeddedWalletInfo: {
    user: {
      username: 'test',
      email: 'testuser@example.com'
    },
    accountType: 'smartAccount',
    authProvider: 'email',
    isSmartAccountDeployed: true
  }
}
