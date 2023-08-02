import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testMW, expect } from './shared/fixtures/w3m-wallet-fixture'

testMW.describe('W3M using wallet web-example', () => {
  testMW.beforeEach(
    async ({ modalPage, walletPage, modalValidator, walletValidator, browserName }) => {
      testMW.skip(
        browserName === 'webkit' && process.platform === 'linux',
        'Webkit on Linux does not support clipboard'
      )

      await modalPage.getUri()
      await walletPage.connect()

      await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
      await modalValidator.expectConnected()
      await walletValidator.expectConnected()
    }
  )

  testMW('Should be able to connect', ({ modalPage, walletPage }) => {
    expect(modalPage).toBeDefined()
    expect(walletPage).toBeDefined()
  })

  testMW(
    'Should send disconnect to wallet',
    async ({ modalPage, modalValidator, walletValidator }) => {
      await modalPage.disconnect()
      await modalValidator.expectDisconnected()
      await walletValidator.expectDisconnected()
    }
  )
  testMW(
    'Should recieve disconnect from a wallet',
    async ({ walletPage, modalValidator, walletValidator }) => {
      await walletPage.disconnect()
      await walletValidator.expectDisconnected()
      await modalValidator.expectDisconnected()
    }
  )

  testMW(
    'Should sign a message',
    async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
      await modalPage.sign()

      await walletValidator.expectRecievedSign({})
      await walletPage.handleRequest({ accept: true })

      await modalValidator.expectAcceptedSign()
    }
  )

  testMW(
    'Should handle rejected sign',
    async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
      await modalPage.sign()

      await walletValidator.expectRecievedSign({})
      await walletPage.handleRequest({ accept: false })

      await modalValidator.expectRejectedSign()
    }
  )

  testMW(
    'should sign typed data',
    async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
      await modalPage.signTyped()

      await walletValidator.expectRecievedSignTyped({})
      await walletPage.handleRequest({ accept: true })

      await modalValidator.expectAcceptedSignTyped()
    }
  )

  testMW(
    'should handle rejected sign typed data',
    async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
      await modalPage.signTyped()

      await walletValidator.expectRecievedSignTyped({})
      await walletPage.handleRequest({ accept: false })

      await modalValidator.expectRejectedSignTyped()
    }
  )

  testMW(
    'should handle chain switch using sign',
    async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
      await modalPage.switchChain({ chainName: 'Polygon' })
      await modalPage.closeModal()

      await modalPage.sign()

      await walletValidator.expectRecievedSign({ chainName: 'Polygon' })
      await walletPage.handleRequest({ accept: true })

      await modalValidator.expectAcceptedSign()
    }
  )

  testMW(
    'should handle chain switch using sign typed',
    async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
      await modalPage.switchChain({ chainName: 'Polygon' })
      await modalPage.closeModal()

      await modalPage.signTyped()

      await walletValidator.expectRecievedSignTyped({ chainName: 'Polygon' })
      await walletPage.handleRequest({ accept: true })

      await modalValidator.expectAcceptedSignTyped()
    }
  )
})
