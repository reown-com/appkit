export const ErrorUtil = {
  UniversalProviderErrors: {
    UNAUTHORIZED_DOMAIN_NOT_ALLOWED: 'Unauthorized: origin not allowed'
  },
  ALERT_ERRORS: {
    INVALID_APP_CONFIGURATION: 'Invalid App Configuration',
    PROJECT_ID_NOT_CONFIGURED: 'Project ID Not Configured',
    PROJECT_ID_NOT_CONFIGURED_UPDATE_CONFIGURATION:
      'Project ID Not Configured - update configuration',
    originNotWhitelisted: (origin: string) =>
      `Origin ${origin} not found on Allowlist - update configuration`,
    originNotWhitelistedSocials: (origin: string) =>
      `Origin ${origin} not found on Allowlist - update configuration to enable social login`
  }
}
