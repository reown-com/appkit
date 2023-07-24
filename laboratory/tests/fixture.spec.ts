import { testMW, expect } from './shared/fixtures/modal-wallet-fix'

testMW('Open pages', ({ modalPage, walletPage }) => {
  expect(modalPage).toBeDefined()
  expect(walletPage).toBeDefined()
})

testMW('Connect', async ({ modalPage, walletPage }) => {
  await modalPage.getUri()
  await walletPage.connect()
})
