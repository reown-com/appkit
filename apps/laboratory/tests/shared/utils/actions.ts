import type { BrowserContext, Page } from '@playwright/test'

export async function doActionAndWaitForNewPage(
  action: Promise<void>,
  context: BrowserContext
): Promise<Page> {
  if (!context) {
    throw new Error('Browser Context is undefined')
  }
  const pagePromise = context.waitForEvent('page')
  await action
  const newPage = await pagePromise

  return newPage
}
