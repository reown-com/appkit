import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testMW, expect } from './shared/fixtures/w3m-wallet-fixture'

testMW.describe('W3M using wallet web-example', () => {
  testMW.beforeEach(async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    await modalPage.getUri()
    await walletPage.connect()

    await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
    await modalValidator.isConnected()
    await walletValidator.isConnected()
  })

  testMW('Should be able to connect', ({ modalPage, walletPage }) => {
    expect(modalPage).toBeDefined()
    expect(walletPage).toBeDefined()
  })

  testMW(
    'Should send disconnect to wallet',
    async ({ modalPage, modalValidator, walletValidator }) => {
      await modalPage.disconnect()
      await modalValidator.isDisconnected()
      await walletValidator.isDisconnected()
    }
  )
  testMW(
    'Should recieve disconnect from a wallet',
    async ({ walletPage, modalValidator, walletValidator }) => {
      await walletPage.disconnect()
      await walletValidator.isDisconnected()
      await modalValidator.isDisconnected()
    }
  )

  testMW(
    'Should sign a message',
    async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
      await modalPage.sign()

      await walletValidator.recievedSign({})
      await walletPage.handleRequest({ accept: true })

      await modalValidator.acceptedSign()
    }
  )

  testMW(
    'Should handle rejected sign',
    async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
      await modalPage.sign()

      await walletValidator.recievedSign({})
      await walletPage.handleRequest({ accept: false })

      await modalValidator.rejectedSign()
    }
  )

  testMW(
    'should sign typed data',
    async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
      await modalPage.signTyped()

      await walletValidator.recievedSignTyped({})
      await walletPage.handleRequest({ accept: true })

      await modalValidator.acceptedSignTyped()
    }
  )

  testMW(
    'should handle rejected sign typed data',
    async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
      await modalPage.signTyped()

      await walletValidator.recievedSignTyped({})
      await walletPage.handleRequest({ accept: false })

      await modalValidator.acceptedSignTyped()
    }
  )

  testMW(
    'should handle chain switch using sign',
    async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
      await modalPage.switchChain({ chainName: 'Polygon' })
      await modalPage.closeModal()

      await modalPage.sign()

      await walletValidator.recievedSign({ chainName: 'Polygon' })
      await walletPage.handleRequest({ accept: true })

      await modalValidator.acceptedSign()
    }
  )

  testMW(
    'should handle chain switch using sign typed',
    async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
      await modalPage.switchChain({ chainName: 'Polygon' })
      await modalPage.closeModal()

      await modalPage.signTyped()

      await walletValidator.recievedSignTyped({ chainName: 'Polygon' })
      await walletPage.handleRequest({ accept: true })

      await modalValidator.acceptedSignTyped()
    }
  )
})
