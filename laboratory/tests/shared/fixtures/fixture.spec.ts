import { testMW, expect } from './w3m-wallet-fixture'

testMW('Open pages', ({ modalPage, walletPage }) => {
  expect(modalPage).toBeDefined()
  expect(walletPage).toBeDefined()
})

testMW('Connect', async ({ modalPage, walletPage }) => {
  await modalPage.getUri()
  await walletPage.connect()

  // Validate methods would go here
  await walletPage.handleSessionProposal({
    reqAccounts: ['1'],
    optAccounts: ['2'],
    accept: true
  })

  // Validate methods would go here
})
