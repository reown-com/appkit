import { createSIWEConfig, formatMessage } from '@reown/appkit-siwe'

export const siweConfig = createSIWEConfig({
  signOutOnAccountChange: true,
  signOutOnNetworkChange: true,
  signOutOnDisconnect: true,
  // We don't require any async action to populate params but other apps might
  // eslint-disable-next-line @typescript-eslint/require-await
  getMessageParams: async () => ({
    domain: window.location.host,
    uri: window.location.origin,
    chains: [1, 137],
    statement: 'Please sign with your account',
    iat: new Date().toISOString()
  }),
  createMessage: ({ address, ...args }) => formatMessage(args, address),
  getNonce: async () => {
    const nonce = 'some-nonce'
    if (!nonce) {
      throw new Error('Failed to get nonce!')
    }

    return nonce
  },
  getSession: async () => {
    const session = {
      address: '0x123',
      chainId: 1
    }
    if (!session) {
      return null
    }

    const { address, chainId } = session

    return { address, chainId }
  },
  verifyMessage: async ({ message, signature, cacao }) => {
    try {
      /*
       * Signed Cacao (CAIP-74) will be available for further validations if the wallet supports caip-222 signing
       * When personal_sign fallback is used, cacao will be undefined
       */
      if (cacao) {
        // Do something
      }

      return true
    } catch (error) {
      return false
    }
  },
  signOut: async () => {
    try {
      await signOut({
        redirect: false
      })

      return true
    } catch (error) {
      return false
    }
  },
  onSignOut() {
    const element = document.querySelector("[data-testid='siwe-event-onSignOut']")
    if (element) {
      element.textContent = 'true'
    }
  },
  onSignIn() {
    const element = document?.querySelector("[data-testid='siwe-event-onSignIn']")
    if (element) {
      element.textContent = 'true'
    }
  }
})
