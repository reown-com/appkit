import { isSafe } from '@reown/appkit-common'
import { OptionsController } from '@reown/appkit-controllers'

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
      displayMessage: 'Network Not Found',
      debugMessage:
        'The specified network is not recognized. Please ensure it is included in the `networks` array of your `createAppKit` configuration.'
    },
    ORIGIN_NOT_ALLOWED: {
      code: 'APKT002',
      displayMessage: 'Invalid App Configuration',
      debugMessage: () =>
        `The origin ${isSafe() ? window.origin : 'unknown'} is not in your allow list. Please update your allowed domains at https://dashboard.reown.com. [PID: ${OptionsController.state.projectId}]`
    },
    IFRAME_LOAD_FAILED: {
      code: 'APKT003',
      displayMessage: 'Network Error: Wallet Load Failed',
      debugMessage: () =>
        'Failed to load the embedded wallet. This may be due to network issues or server downtime. Please check your network connection and try again shortly. Contact support if the issue persists.'
    },
    IFRAME_REQUEST_TIMEOUT: {
      code: 'APKT004',
      displayMessage: 'Wallet Request Timeout',
      debugMessage: () =>
        'The request to the embedded wallet timed out. Please check your network connection and try again shortly. Contact support if the issue persists.'
    },
    UNVERIFIED_DOMAIN: {
      code: 'APKT005',
      displayMessage: 'Unverified Domain',
      debugMessage: () =>
        'Embedded wallet load failed. Ensure your domain is verified in https://dashboard.reown.com.'
    },
    JWT_TOKEN_NOT_VALID: {
      code: 'APKT006',
      displayMessage: 'Session Expired',
      debugMessage:
        'Your session is invalid or expired. Please check your system’s date and time settings, then reconnect.'
    },
    INVALID_PROJECT_ID: {
      code: 'APKT007',
      displayMessage: 'Invalid Project ID',
      debugMessage:
        'The specified project ID is invalid. Please visit https://dashboard.reown.com to obtain a valid project ID.'
    },
    PROJECT_ID_NOT_CONFIGURED: {
      code: 'APKT008',
      displayMessage: 'Project ID Missing',
      debugMessage:
        'No project ID is configured. You can create and configure a project ID at https://dashboard.reown.com.'
    },
    SERVER_ERROR_APP_CONFIGURATION: {
      code: 'APKT009',
      displayMessage: 'Server Error',
      debugMessage: (errorMessage?: string) =>
        `Unable to fetch App Configuration. ${errorMessage}. Please check your network connection and try again shortly. Contact support if the issue persists.`
    },
    RATE_LIMITED_APP_CONFIGURATION: {
      code: 'APKT010',
      displayMessage: 'Rate Limited',
      debugMessage:
        'You have been rate limited while retrieving App Configuration. Please wait a few minutes and try again. Contact support if the issue persists.'
    }
  },
  ALERT_WARNINGS: {
    LOCAL_CONFIGURATION_IGNORED: {
      debugMessage: (warningMessage: string) => `[Reown Config Notice] ${warningMessage}`
    },
    INACTIVE_NAMESPACE_NOT_CONNECTED: {
      code: 'APKTW001',
      displayMessage: 'Inactive Namespace Not Connected',
      debugMessage: (namespace: string, errorMessage?: string) =>
        `An error occurred while connecting an inactive namespace ${namespace}: "${errorMessage}"`
    },
    INVALID_EMAIL: {
      code: 'APKTW002',
      displayMessage: 'Invalid Email Address',
      debugMessage: 'Please enter a valid email address'
    }
  }
}
