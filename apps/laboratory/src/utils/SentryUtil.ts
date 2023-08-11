import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/browser'

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
