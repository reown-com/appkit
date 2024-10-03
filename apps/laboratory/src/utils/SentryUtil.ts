import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/browser'
import packageJson from '../../package.json' assert { type: 'json' }
import type { AppKit } from '@reown/appkit'

const TESTING_CONFIGURATION_TAG_KEY = 'testing-configuration'

export function bootstrapSentry() {
  // eslint-disable-next-line no-console
  console.log('Version', packageJson.dependencies['@reown/appkit'])

  const dsn = process.env['NEXT_PUBLIC_SENTRY_DSN']
  if (dsn) {
    Sentry.init({
      dsn,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0
    })
  }
}

export function setSdkVersion(version: string) {
  Sentry.withScope(scope => {
    scope.addEventProcessor(event => {
      event.release = version

      return event
    })
  })
}

export function setTestingConfiguration(value: string) {
  setTag(TESTING_CONFIGURATION_TAG_KEY, value)
}

function setTag(key: string, value: string) {
  Sentry.withScope(scope => {
    scope.setTag(key, value)
  })
}

export function updateSentryEnvironment(modal: AppKit) {
  if (typeof window === 'undefined') {
    setTestingConfiguration(window.location.pathname)
  }
}
