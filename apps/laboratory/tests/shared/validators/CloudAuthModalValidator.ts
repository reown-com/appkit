import { expect } from '@playwright/test'

import { ModalValidator } from './ModalValidator'

export class CloudAuthModalValidator extends ModalValidator {
  get sessionStatus() {
    return this.page.getByTestId('cloud-auth-session-status')
  }

  get sessionAccount() {
    return this.page.getByTestId('cloud-auth-session-account')
  }

  async expectEmptySession() {
    await expect(this.sessionStatus).toHaveText('No session detected yet')
  }

  async expectSession() {
    const text = await this.sessionStatus.innerText()
    const object = JSON.parse(text)

    expect(object).toMatchObject({
      message: expect.any(String),
      signature: expect.any(String),
      data: expect.any(Object)
    })

    return object
  }

  async expectSessionAccount() {
    const text = await this.sessionAccount.innerText()
    const object = JSON.parse(text)

    expect(object).toMatchObject(expect.any(Object))

    return object
  }
}
