/* eslint no-console: 0 */

import { testConnectedMW } from './shared/fixtures/w3m-wallet-fixture'
import { timeEnd, timeStart } from './shared/utils/logs'
import { uploadCanaryResultsToCloudWatch } from './shared/utils/metrics'
import { expectConnection } from './shared/utils/validation'

const ENV = process.env['ENVIRONMENT'] || 'dev'
const REGION = process.env['REGION'] || 'eu-central-1'

testConnectedMW.beforeEach(async ({ modalValidator, walletValidator }) => {
  timeStart('beforeEach expectConnection')
  await expectConnection(modalValidator, walletValidator)
  timeEnd('beforeEach expectConnection')
})

testConnectedMW.afterEach(async ({ browserName, timingRecords }, testInfo) => {
  if (browserName === 'firefox') {
    return
  }

  if (ENV !== 'dev') {
    timeStart('uploadCanaryResultsToCloudWatch')
    const duration: number = testInfo.duration
    await uploadCanaryResultsToCloudWatch(
      ENV,
      REGION,
      'https://lab.web3modal.com/',
      'HappyPath.sign',
      testInfo.status === 'passed',
      duration,
      timingRecords
    )
    timeEnd('uploadCanaryResultsToCloudWatch')
  }
})

testConnectedMW(
  'it should sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator, timingRecords }) => {
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
