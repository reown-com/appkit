export const ErrorUtil = {
  UniversalProviderErrors: {
    UNAUTHORIZED_DOMAIN_NOT_ALLOWED: 'Unauthorized: origin not allowed'
  },
  ALERT_ERRORS: {
    INVALID_APP_CONFIGURATION: {
      shortMessage: 'Invalid App Configuration',
      longMessage: () =>
        `Origin ${
          isSafe() ? window.origin : 'unknown'
        } not found on Allowlist - update configuration`
    },
    INVALID_APP_CONFIGURATION_SOCIALS: {
      shortMessage: 'Invalid App Configuration',
      longMessage: () =>
        `Origin ${
          isSafe() ? window.origin : 'unknown'
        } not found on Allowlist - update configuration to enable social login`
    },
    PROJECT_ID_NOT_CONFIGURED: {
      shortMessage: 'Project ID Not Configured',
      longMessage: 'Project ID Not Configured - update configuration'
    }
  }
}

function isSafe() {
  return typeof window !== 'undefined'
}
