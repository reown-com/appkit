export const mockUser = {
  address: '0x123',
  accounts: [
    { address: '0x1', type: 'eoa' },
    { address: '0x2', type: 'smartAccount' }
  ],
  preferredAccountType: 'eoa',
  user: {
    email: 'email@test.com',
    username: 'test'
  }
}

export const mockUserBalance = {
  symbol: 'ETH',
  balance: '1000'
}
