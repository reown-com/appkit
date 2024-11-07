export const ErrorUtil = {
  UniversalProviderErrors: {
    UNAUTHORIZED_DOMAIN_NOT_ALLOWED: {
      message: 'Unauthorized: origin not allowed',
      alertErrorKey: 'INVALID_APP_CONFIGURATION'
    },
    JWT_VALIDATION_ERROR: {
      message: 'JWT validation error: JWT Token is not yet valid',
      alertErrorKey: 'JWT_TOKEN_NOT_VALID'
    }
  },
  ALERT_ERRORS: {
    SWITCH_NETWORK_NOT_FOUND: {
      shortMessage: 'Network Not Found',
      longMessage:
        "Network not found - please make sure it is included in 'networks' array in createAppKit function"
    },
    INVALID_APP_CONFIGURATION: {
      shortMessage: 'Invalid App Configuration',
      longMessage: () =>
        `Origin ${
          isSafe() ? window.origin : 'unknown'
        } not found on Allowlist - update configuration on cloud.reown.com`
    },
    SOCIALS_TIMEOUT: {
      shortMessage: 'Invalid App Configuration',
      longMessage: () =>
        'There was an issue loading the embedded wallet. Please verify that your domain is allowed at cloud.reown.com'
    },
    JWT_TOKEN_NOT_VALID: {
      shortMessage: 'Session Expired',
      longMessage:
        'Invalid session found on UniversalProvider - please check your time settings and connect again'
    },
    PROJECT_ID_NOT_CONFIGURED: {
      shortMessage: 'Project ID Not Configured',
      longMessage: 'Project ID Not Configured - update configuration on cloud.reown.com'
    }
  }
}

function isSafe() {
  return typeof window !== 'undefined'
}
