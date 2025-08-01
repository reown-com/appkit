/* eslint no-console: 0 */
import { WalletValidator } from '@reown/appkit-testing'

import { testConnectedMW } from './shared/fixtures/w3m-wallet-fixture'
import { timeEnd, timeStart } from './shared/utils/logs'
import { afterEachCanary, getCanaryTagAndAnnotation } from './shared/utils/metrics'
import { expectConnection } from './shared/utils/validation'
import { ModalValidator } from './shared/validators/ModalValidator'

testConnectedMW.beforeEach(async ({ modalPage, walletPage }) => {
  const modalValidator = new ModalValidator(modalPage.page)
  const walletValidator = new WalletValidator(walletPage.page)
  timeStart('beforeEach expectConnection')
  await expectConnection(modalValidator, walletValidator)
  timeEnd('beforeEach expectConnection')
})

testConnectedMW.afterEach(async ({ browserName, timingRecords }, testInfo) => {
  if (browserName === 'firefox') {
    return
  }
  await afterEachCanary(testInfo, timingRecords)
})

testConnectedMW(
  'it should sign',
  getCanaryTagAndAnnotation('HappyPath.sign'),
  async ({ modalPage, walletPage, timingRecords }) => {
    const modalValidator = new ModalValidator(modalPage.page)
    const walletValidator = new WalletValidator(walletPage.page)
    timeStart('modalPage.sign()')
    await modalPage.sign()
    timeEnd('modalPage.sign()')
    const signRequestedTime = new Date()
    timeStart('walletValidator.expectReceivedSign')
    await walletValidator.expectReceivedSign({})
    timeEnd('walletValidator.expectReceivedSign')
    const signReceivedTime = new Date()
    timingRecords.push({
      item: 'sign',
      timeMs: signReceivedTime.getTime() - signRequestedTime.getTime()
    })
    timeStart('walletPage.handleRequest')
    await walletPage.handleRequest({ accept: true })
    timeEnd('walletPage.handleRequest')
    timeStart('modalValidator.expectAcceptedSign')
    await modalValidator.expectAcceptedSign()
    timeEnd('modalValidator.expectAcceptedSign')
    timeStart('modalPage.disconnect')
    await modalPage.disconnect()
    timeEnd('modalPage.disconnect')
    const disconnectRequestedTime = new Date()
    timeStart('walletValidator.expectDisconnected')
    await walletValidator.expectDisconnected()
    timeEnd('walletValidator.expectDisconnected')
    // The wallet completes the disconnect first, so testing the disconnect time of the wallet before the disconnect time of the app
    const disconnectWalletReceivedTime = new Date()
    timingRecords.push({
      item: 'disconnectWallet',
      timeMs: disconnectWalletReceivedTime.getTime() - disconnectRequestedTime.getTime()
    })
    timeStart('modalValidator.expectDisconnected')
    await modalValidator.expectDisconnected()
    timeEnd('modalValidator.expectDisconnected')
    const disconnectAppReceivedTime = new Date()
    timingRecords.push({
      item: 'disconnectApp',
      timeMs: disconnectAppReceivedTime.getTime() - disconnectRequestedTime.getTime()
    })
  }
)
