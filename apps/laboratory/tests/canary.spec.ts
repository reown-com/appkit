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

testConnectedMW.afterEach(async ({ browserName }, testInfo) => {
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
      duration
    )
    timeEnd('uploadCanaryResultsToCloudWatch')
  }
})

testConnectedMW(
  'it should sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    timeStart('modalPage.sign()')
    await modalPage.sign()
    timeEnd('modalPage.sign()')
    timeStart('walletValidator.expectReceivedSign')
    await walletValidator.expectReceivedSign({})
    timeEnd('walletValidator.expectReceivedSign')
    timeStart('walletPage.handleRequest')
    await walletPage.handleRequest({ accept: true })
    timeEnd('walletPage.handleRequest')
    timeStart('modalValidator.expectAcceptedSign')
    await modalValidator.expectAcceptedSign()
    timeEnd('modalValidator.expectAcceptedSign')
    timeStart('modalPage.disconnect')
    await modalPage.disconnect()
    timeEnd('modalPage.disconnect')
    timeStart('modalValidator.expectDisconnected')
    await modalValidator.expectDisconnected()
    timeEnd('modalValidator.expectDisconnected')
    timeStart('walletValidator.expectDisconnected')
    await walletValidator.expectDisconnected()
    timeEnd('walletValidator.expectDisconnected')
  }
)
