import { expect, test } from '@playwright/test'

test('should load all components', async ({ page }) => {
  await expect(page.getByTestId('component-modal-backcard')).toBeVisible()
})
