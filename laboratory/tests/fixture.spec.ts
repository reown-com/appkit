import { testMW, expect } from './shared/fixtures/modal-wallet-fix'

testMW('Open pages', ({ modalPage, walletPage }) => {
  expect(walletPage).toBeDefined()
  expect(modalPage).toBeDefined()
})
