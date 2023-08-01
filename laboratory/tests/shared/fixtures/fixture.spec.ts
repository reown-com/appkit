import { testMW, expect } from './w3m-wallet-fixture'

testMW('Open pages', ({ modalPage, walletPage }) => {
  expect(modalPage).toBeDefined()
  expect(walletPage).toBeDefined()
})
