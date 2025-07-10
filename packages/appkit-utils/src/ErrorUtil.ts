const abortController = new AbortController()

export const ErrorUtil = {
  EmbeddedWalletAbortController: abortController,
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
      shortMessage: 'Network Not Found',
      longMessage:
        "Network not found. Please make sure it is included in 'networks' array in createAppKit function."
    },
    ORIGIN_NOT_ALLOWED: {
      shortMessage: 'Origin Not Allowed',
      longMessage: () =>
        `🔧 Origin ${
          isSafe() ? window.origin : 'unknown'
        } not found on allow list. Please update your project configurations on dashboard.reown.com.`
    },
    IFRAME_LOAD_FAILED: {
      shortMessage: 'Network Error - Could not load embedded wallet',
      longMessage: () => 'There was an issue loading the embedded wallet. Please try again later.'
    },
    IFRAME_REQUEST_TIMEOUT: {
      shortMessage: 'Embedded Wallet Request Timed Out',
      longMessage: () =>
        'There was an issue doing the request to the embedded wallet. Please try again later.'
    },
    UNVERIFIED_DOMAIN: {
      shortMessage: 'Unverified Domain',
      longMessage: () =>
        'There was an issue loading the embedded wallet. Please verify that your domain is allowed at dashboard.reown.com.'
    },

    JWT_TOKEN_NOT_VALID: {
      shortMessage: 'Session Expired',
      longMessage:
        'Invalid session found on UniversalProvider. Please check your time settings and connect again.'
    },
    INVALID_PROJECT_ID: {
      shortMessage: 'Invalid Project ID',
      longMessage: 'The project ID is invalid. Visit dashboard.reown.com to get a new one.'
    },
    PROJECT_ID_NOT_CONFIGURED: {
      shortMessage: 'Project ID Not Configured',
      longMessage:
        'Project ID Not Configured. Please update your project configurations on dashboard.reown.com.'
    },
    SERVER_ERROR_APP_CONFIGURATION: {
      shortMessage: 'Server Error',
      longMessage: (errorMessage?: string) =>
        `Failed to get App Configuration ${errorMessage || ''}`
    },
    RATE_LIMITED_APP_CONFIGURATION: {
      shortMessage: 'Rate Limited',
      longMessage: 'Rate limited when trying to get the App Configuration'
    }
  }
}

function isSafe() {
  return typeof window !== 'undefined'
}
