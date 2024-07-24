import { ConstantsUtil as constants } from '@web3modal/common'
import {
  appKitAuthSignOut,
  authenticate,
  createSIWEConfig,
  formatMessage,
  getAppKitAuthSession,
  getNonce,
  type SIWECreateMessageArgs,
  type SIWESession,
  type SIWEVerifyMessageArgs
} from '@web3modal/siwe'
import { ConstantsUtil } from './ConstantsUtil'

const headers = {
  'x-project-id': ConstantsUtil.ProjectId,
  'x-sdk-type': 'w3m',
  'x-sdk-version': '5.0.0'
}
export async function addCurrentAccountToProfile() {
  try {
    const res = await fetch(`${constants.W3M_API_URL}/profiles/v1/add-account`, {
      method: 'POST',
      headers,
      body: null,
      credentials: 'include'
    })

    if (!res.ok) {
      return undefined
    }

    const accountAddedToProfileRes = await res.json()

    return accountAddedToProfileRes
  } catch (error) {
    throw new Error('Failed to add account to profile', {
      cause: error
    })
  }
}

export const siweProfilesConfig = createSIWEConfig({
  signOutOnAccountChange: true,
  signOutOnNetworkChange: true,
  // We don't require any async action to populate params but other apps might
  // eslint-disable-next-line @typescript-eslint/require-await
  getMessageParams: async () => ({
    domain: window.location.host,
    uri: window.location.origin,
    statement: 'Please sign with your account',
    iat: new Date().toISOString()
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) => {
    const message = formatMessage(args, address)

    return message
  },
  getNonce: async () => {
    const { nonce } = await getNonce()
    if (!nonce) {
      throw new Error('Failed to get nonce!')
    }

    return nonce
  },
  getSession: async () => {
    const session = await getAppKitAuthSession()
    if (!session) {
      return null
    }

    const { address, chainId } = session as unknown as SIWESession

    return { address, chainId }
  },
  verifyMessage: async ({ message, signature, cacao, clientId }: SIWEVerifyMessageArgs) => {
    try {
      /*
       * Signed Cacao (CAIP-74) will be available for further validations if the wallet supports caip-222 signing
       * When personal_sign fallback is used, cacao will be undefined
       */
      if (cacao) {
        // Do something
      }
      const { token } = await authenticate({ message, signature, clientId })
      await addCurrentAccountToProfile()

      return Boolean(token)
    } catch (error) {
      return false
    }
  },
  signOut: async () => {
    try {
      await appKitAuthSignOut()

      return true
    } catch (error) {
      return false
    }
  }
})
