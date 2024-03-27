import { testConnectedMW } from './shared/fixtures/w3m-wallet-fixture'
import { uploadCanaryResultsToCloudWatch } from './shared/utils/metrics'
import { expectConnection } from './shared/utils/validation'

const ENV = process.env['ENVIRONMENT'] || 'dev'
const REGION = process.env['REGION'] || 'eu-central-1'

testConnectedMW.beforeEach(async ({ modalValidator, walletValidator }) => {
  console.time('beforeEach expectConnection')
  await expectConnection(modalValidator, walletValidator)
  console.timeEnd('beforeEach expectConnection')
})

testConnectedMW.afterEach(async ({ browserName }, testInfo) => {
  if (browserName === 'firefox') {
    return
  }

  if (ENV !== 'dev') {
    console.time('uploadCanaryResultsToCloudWatch')
    const duration: number = testInfo.duration
    await uploadCanaryResultsToCloudWatch(
      ENV,
      REGION,
      'https://lab.web3modal.com/',
      'HappyPath.sign',
      testInfo.status === 'passed',
      duration
    )
    console.timeEnd('uploadCanaryResultsToCloudWatch')
  }
})

testConnectedMW(
  'it should sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    console.time('modalPage.sign()')
    await modalPage.sign()
    console.timeEnd('modalPage.sign()')
    console.time('walletValidator.expectReceivedSign')
    await walletValidator.expectReceivedSign({})
    console.timeEnd('walletValidator.expectReceivedSign')
    console.time('walletPage.handleRequest')
    await walletPage.handleRequest({ accept: true })
    console.timeEnd('walletPage.handleRequest')
    console.time('modalValidator.expectAcceptedSign')
    await modalValidator.expectAcceptedSign()
    console.timeEnd('modalValidator.expectAcceptedSign')
    console.time('modalPage.disconnect')
    await modalPage.disconnect()
    console.timeEnd('modalPage.disconnect')
    console.time('modalValidator.expectDisconnected')
    await modalValidator.expectDisconnected()
    console.timeEnd('modalValidator.expectDisconnected')
    console.time('walletValidator.expectDisconnected')
    await walletValidator.expectDisconnected()
    console.timeEnd('walletValidator.expectDisconnected')
  }
)
