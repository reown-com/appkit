// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://6651d59287f1df225f5b055a8637b8ec@o1095249.ingest.us.sentry.io/4509018928054272',

  sampleRate: 0.5,
  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.2,

  ignoreErrors: [
    "Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.",
    'Proposal expired'
  ],

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Only enable Sentry in production
  enabled: process.env.NODE_ENV === 'production'
})
