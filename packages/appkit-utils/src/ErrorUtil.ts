export const ErrorUtil = {
  UniversalProviderErrors: {
    UNAUTHORIZED_DOMAIN_NOT_ALLOWED: 'Unauthorized: origin not allowed'
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
    INVALID_APP_CONFIGURATION_SOCIALS: {
      shortMessage: 'Invalid App Configuration',
      longMessage: () =>
        `Origin ${
          isSafe() ? window.origin : 'unknown'
        } not found on Allowlist - update configuration on cloud.reown.com to enable social login`
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
