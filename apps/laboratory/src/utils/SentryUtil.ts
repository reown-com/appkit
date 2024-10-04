import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/browser'
import type { AppKit } from '@reown/appkit'

const TESTING_CONFIGURATION_TAG_KEY = 'testing-configuration'
const FULL_VERSION_TAG_KEY = 'full-version'

export function bootstrapSentry() {
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
      event.release = version.split('-')[1]

      return event
    })
    scope.setTag(FULL_VERSION_TAG_KEY, version)
  })
}

export function setTestingConfiguration(value: string) {
  setTag(TESTING_CONFIGURATION_TAG_KEY, value.replace('/library/', '').replace('/', ''))
}

function setTag(key: string, value: string) {
  Sentry.withScope(scope => {
    scope.setTag(key, value)
  })
}

export function updateSentryEnvironment(modal: AppKit) {
  setSdkVersion(modal.version)

  if (typeof window !== 'undefined') {
    setTestingConfiguration(window.location.pathname)
  }
}
