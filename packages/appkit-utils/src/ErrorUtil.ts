import { isSafe } from '@reown/appkit-common'

const abortController = new AbortController()

export const ErrorUtil = {
  EmbeddedWalletAbortController: abortController,
  /**
   * Universal Provider errors. Make sure the `message` is matching with the errors thrown by the Universal Provider.
   * We use the `alertErrorKey` to map the error to the correct AppKit alert error.
   */
  UniversalProviderErrors: {
    UNAUTHORIZED_DOMAIN_NOT_ALLOWED: {
      message: 'Unauthorized: origin not allowed',
      alertErrorKey: 'ORIGIN_NOT_ALLOWED'
    },
    JWT_VALIDATION_ERROR: {
      message: 'JWT validation error: JWT Token is not yet valid',
      alertErrorKey: 'JWT_TOKEN_NOT_VALID'
    },
    INVALID_KEY: {
      message: 'Unauthorized: invalid key',
      alertErrorKey: 'INVALID_PROJECT_ID'
    }
  },
  ALERT_ERRORS: {
    SWITCH_NETWORK_NOT_FOUND: {
      code: 'APKT001',
      shortMessage: 'Network Not Found',
      longMessage:
        "The specified network is not recognized. Ensure it is included in the 'networks' array of your `createAppKit` configuration."
    },
    ORIGIN_NOT_ALLOWED: {
      code: 'APKT002',
      shortMessage: 'Invalid App Configuration',
      longMessage: () =>
        `Origin ${isSafe() ? window.origin : 'unknown'} is not in your allow list. Please update your allowed domains at https://dashboard.reown.com.`
    },
    IFRAME_LOAD_FAILED: {
      code: 'APKT003',
      shortMessage: 'Network Error: Wallet Load Failed',
      longMessage: () =>
        'Failed to load the embedded wallet. This may be due to network issues. Please try again later.'
    },
    IFRAME_REQUEST_TIMEOUT: {
      code: 'APKT004',
      shortMessage: 'Wallet Request Timeout',
      longMessage: () => 'The request to the embedded wallet timed out. Please try again shortly.'
    },
    UNVERIFIED_DOMAIN: {
      code: 'APKT005',
      shortMessage: 'Unverified Domain',
      longMessage: () =>
        'Embedded wallet load failed. Ensure your domain is verified in https://dashboard.reown.com.'
    },
    JWT_TOKEN_NOT_VALID: {
      code: 'APKT006',
      shortMessage: 'Session Expired',
      longMessage: 'Your session is invalid or expired. Check your system’s time and reconnect.'
    },
    INVALID_PROJECT_ID: {
      code: 'APKT007',
      shortMessage: 'Invalid Project ID',
      longMessage:
        'The specified project ID is invalid. Please visit https://dashboard.reown.com to retrieve a valid one.'
    },
    PROJECT_ID_NOT_CONFIGURED: {
      code: 'APKT008',
      shortMessage: 'Project ID Missing',
      longMessage:
        'Project ID is not configured. You can create a project ID at https://dashboard.reown.com.'
    },
    SERVER_ERROR_APP_CONFIGURATION: {
      code: 'APKT009',
      shortMessage: 'Server Error',
      longMessage: (errorMessage?: string) =>
        `Unable to fetch App Configuration. ${errorMessage || 'Please try again later.'}`
    },
    RATE_LIMITED_APP_CONFIGURATION: {
      code: 'APKT010',
      shortMessage: 'Rate Limited',
      longMessage:
        'You have been rate limited while retrieving App Configuration. Please wait and retry.'
    }
  }
}
