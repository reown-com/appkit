import { testConnectedMW } from './shared/fixtures/w3m-wallet-fixture'
import { uploadCanaryResultsToCloudWatch } from './shared/utils/metrics'
import { expectConnection } from './shared/utils/validation'

const ENV = process.env['ENVIRONMENT'] || 'dev'
const REGION = process.env['REGION'] || 'eu-central-1'

let startTime = 0

testConnectedMW.beforeEach(async ({ modalValidator, walletValidator }) => {
  // Give us extra time in a potentially slow canary deployment
  testConnectedMW.setTimeout(120_000)

  startTime = Date.now()
  await expectConnection(modalValidator, walletValidator)
})

testConnectedMW.afterEach(async ({ modalPage, modalValidator, walletValidator, browserName }) => {
  if (browserName === 'firefox') {
    return
  }
  await modalPage.disconnect()
  await modalValidator.expectDisconnected()
  await walletValidator.expectDisconnected()
})

testConnectedMW(
  'it should sign',
  async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
    await modalPage.sign()
    await walletValidator.expectReceivedSign({})
    await walletPage.handleRequest({ accept: true })
    await modalValidator.expectAcceptedSign()

    if (ENV !== 'dev') {
      const duration: number = Date.now() - startTime
      await uploadCanaryResultsToCloudWatch(
        ENV,
        REGION,
        'https://lab.web3modal.com/',
        'HappyPath.sign',
        true,
        duration
      )
    }
  }
)
