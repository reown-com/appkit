import type { Page } from '@playwright/test'

export function setupNetworkListener(page: Page) {
  page.on('response', response => {
    if (!response.ok()) {
      // eslint-disable-next-line no-console
      console.log(
        `Failed network request: ${response.request().method()} ${response.url()} - Status: ${response.status()}`
      )
    }
  })
}
