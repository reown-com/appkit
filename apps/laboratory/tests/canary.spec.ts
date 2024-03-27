import { testConnectedMW } from './shared/fixtures/w3m-wallet-fixture'
import { uploadCanaryResultsToCloudWatch } from './shared/utils/metrics'
import { expectConnection } from './shared/utils/validation'

const ENV = process.env['ENVIRONMENT'] || 'dev'
const REGION = process.env['REGION'] || 'eu-central-1'

testConnectedMW.beforeEach(async ({ modalValidator, walletValidator }) => {
  // eslint-disable-next-line no-console
  console.time('beforeEach expectConnection')
  await expectConnection(modalValidator, walletValidator)
  // eslint-disable-next-line no-console
  console.timeEnd('beforeEach expectConnection')
})

testConnectedMW.afterEach(async ({ browserName }, testInfo) => {
  if (browserName === 'firefox') {
    return
  }

  if (ENV !== 'dev') {
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.timeEnd('uploadCanaryResultsToCloudWatch')
  }
})

testConnectedMW(
  'it should sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    // eslint-disable-next-line no-console
    console.time('modalPage.sign()')
    await modalPage.sign()
    // eslint-disable-next-line no-console
    console.timeEnd('modalPage.sign()')
    // eslint-disable-next-line no-console
    console.time('walletValidator.expectReceivedSign')
    await walletValidator.expectReceivedSign({})
    // eslint-disable-next-line no-console
    console.timeEnd('walletValidator.expectReceivedSign')
    // eslint-disable-next-line no-console
    console.time('walletPage.handleRequest')
    await walletPage.handleRequest({ accept: true })
    // eslint-disable-next-line no-console
    console.timeEnd('walletPage.handleRequest')
    // eslint-disable-next-line no-console
    console.time('modalValidator.expectAcceptedSign')
    await modalValidator.expectAcceptedSign()
    // eslint-disable-next-line no-console
    console.timeEnd('modalValidator.expectAcceptedSign')
    // eslint-disable-next-line no-console
    console.time('modalPage.disconnect')
    await modalPage.disconnect()
    // eslint-disable-next-line no-console
    console.timeEnd('modalPage.disconnect')
    // eslint-disable-next-line no-console
    console.time('modalValidator.expectDisconnected')
    await modalValidator.expectDisconnected()
    // eslint-disable-next-line no-console
    console.timeEnd('modalValidator.expectDisconnected')
    // eslint-disable-next-line no-console
    console.time('walletValidator.expectDisconnected')
    await walletValidator.expectDisconnected()
    // eslint-disable-next-line no-console
    console.timeEnd('walletValidator.expectDisconnected')
  }
)
