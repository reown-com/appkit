import { browserTracingIntegration } from '@sentry/browser'
import * as Sentry from '@sentry/react'

export function bootstrapSentry() {
  const dsn = process.env['NEXT_PUBLIC_SENTRY_DSN']
  if (dsn) {
    Sentry.init({
      dsn,
      integrations: [browserTracingIntegration()],
      tracesSampleRate: 0.01
    })
  }
}
