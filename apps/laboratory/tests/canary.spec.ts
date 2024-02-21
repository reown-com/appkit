import { DEFAULT_SESSION_PARAMS } from './shared/constants'
import { testConnectedMW } from './shared/fixtures/w3m-wallet-fixture'
import { uploadCanaryResultsToCloudWatch } from './shared/utils/metrics'

const ENV = process.env['ENVIRONMENT'] || 'dev'
const REGION = process.env['REGION'] || 'eu-central-1'

let startTime = 0

testConnectedMW.beforeEach(async ({ modalPage, walletPage, modalValidator, walletValidator }) => {
  // Give us extra time in a potentially slow canary deployment
  testConnectedMW.setTimeout(120_000)

  startTime = Date.now()
  await walletPage.handleSessionProposal(DEFAULT_SESSION_PARAMS)
  await modalValidator.expectConnected()
  await walletValidator.expectConnected()
  await modalPage.page.evaluate(`window.localStorage.setItem('WALLETCONNECT_DEEPLINK_CHOICE', '')`)
})

testConnectedMW.afterEach(async ({ modalPage, modalValidator, walletValidator }) => {
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
