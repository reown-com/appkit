import type { Page } from '@playwright/test'

export function setupNetworkListener(page: Page) {
  page.on('response', response => {
    if (!response.ok() && response.status() !== 308 && response.status() !== 429) {
      // eslint-disable-next-line no-console
      console.log(
        `Failed network request: ${response.request().method()} ${response.url()} - Status: ${response.status()}`
      )
    }
  })
}
