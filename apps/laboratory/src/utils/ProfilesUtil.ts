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
} from '@reown/appkit-siwe'

import { type Config, disconnect } from '@wagmi/core'
import { ProfileStore } from './ProfileStoreUtil'
const queryParams = `projectId=24970167f11c121f6eb40b558edb9691&st=w3m&sv=5.0.0`

const profilesApiUrl = 'https://api-web3modal-staging.walletconnect-v1-bridge.workers.dev'

export async function addCurrentAccountToProfile(baseUrl = profilesApiUrl) {
  try {
    const res = await fetch(`${baseUrl}/profiles/v1/add-account?${queryParams}`, {
      method: 'POST',
      body: null,
      credentials: 'include'
    })

    if (res.status === 409) {
      throw new Error('Account already associated to a profile')
    }

    if (!res.ok) {
      return undefined
    }

    const accountAddedToProfileRes = await res.json()

    return accountAddedToProfileRes
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to add account to profile', {
      cause: error
    })
  }
}

export async function getProfile(baseUrl = profilesApiUrl) {
  try {
    const res = await fetch(`${baseUrl}/profiles/v1?${queryParams}`, {
      method: 'GET',
      credentials: 'include'
    })

    if (!res.ok) {
      return undefined
    }

    const profile = await res.json()

    return profile
  } catch (error) {
    throw new Error('Failed to fetch profile', {
      cause: error
    })
  }
}

export async function unlinkAccountFromProfile(accountUuid: string, baseUrl = profilesApiUrl) {
  try {
    const res = await fetch(`${baseUrl}/profiles/v1/${accountUuid}?${queryParams}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) {
      return { actionStatus: 'failed' }
    }

    const unlinkedAccountRes = await res.json()

    return {
      actionStatus: unlinkedAccountRes.actionStatus,
      newMainAccountUuid: unlinkedAccountRes.newMainAccountUuid
    }
  } catch (error) {
    throw new Error('Failed to unlink account from profile', {
      cause: error
    })
  }
}

export async function deleteProfile(baseUrl = profilesApiUrl) {
  try {
    const res = await fetch(`${baseUrl}/profiles/v1?${queryParams}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    return { success: res.ok && res.status === 204 }
  } catch (error) {
    throw new Error('Failed to delete profile', {
      cause: error
    })
  }
}

export async function updateMainAccount(accountUuid: string, baseUrl = profilesApiUrl) {
  try {
    const res = await fetch(`${baseUrl}/profiles/v1/main-account/${accountUuid}?${queryParams}`, {
      method: 'PATCH',
      credentials: 'include'
    })

    return { success: res.ok && res.status === 204 }
  } catch (error) {
    throw new Error('Failed to update main account', {
      cause: error
    })
  }
}

export async function sendOtp(baseUrl = profilesApiUrl) {
  try {
    const res = await fetch(`${baseUrl}/profiles/v1/otp?${queryParams}`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ email: 'example@walletconnect.com' })
    })

    if (!res.ok) {
      throw new Error('Failed to send OTP')
    }

    return { success: res.ok }
  } catch (error) {
    throw new Error('Failed to send OTP', {
      cause: error
    })
  }
}

export async function verifyOtp(baseUrl = profilesApiUrl) {
  try {
    const res = await fetch(`${baseUrl}/profiles/v1/otp/verify?${queryParams}`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ otp: '123456' })
    })

    if (!res.ok) {
      throw new Error('Failed to verify OTP')
    }

    const verifyOtpRes = await res.json()

    return { isValid: verifyOtpRes.isValid }
  } catch (error) {
    throw new Error('Failed to send OTP', {
      cause: error
    })
  }
}

export function siweProfilesConfig(wagmiConfig: Config) {
  return createSIWEConfig({
    signOutOnAccountChange: true,
    signOutOnNetworkChange: true,
    signOutOnDisconnect: true,
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
      /*
       * Signed Cacao (CAIP-74) will be available for further validations if the wallet supports caip-222 signing
       * When personal_sign fallback is used, cacao will be undefined
       */
      if (cacao) {
        // Do something
      }
      const { token } = await authenticate({
        message,
        signature,
        clientId
      })

      const profileUuid = await addCurrentAccountToProfile()
      if (!profileUuid) {
        throw new Error('Failed to add account to profile')
      }

      const profile = await getProfile()
      ProfileStore.setProfile(profile.accounts)

      return Boolean(profileUuid && token)
    },
    signOut: async () => {
      try {
        await appKitAuthSignOut()

        return true
      } catch (error) {
        return false
      }
    },
    onSignIn: async () => {
      await disconnect(wagmiConfig)
    }
  })
}
