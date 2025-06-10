import { Mailsac } from '@mailsac/api'

const EMAIL_CHECK_INTERVAL = 2500
const MAX_EMAIL_CHECK = 96
const EMAIL_APPROVE_BUTTON_TEXT = 'Approve this login'
const APPROVE_URL_REGEX = /https:\/\/register.*/u
const OTP_CODE_REGEX = /\d{3}\s?\d{3}/u
const EMAIL_DOMAIN = 'web3modal.msdc.co'

export class Email {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private readonly mailsac: Mailsac<any>
  public readonly apiKey: string
  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.mailsac = new Mailsac({ headers: { 'Mailsac-Key': apiKey } })
  }

  async deleteAllMessages(email: string) {
    return await this.mailsac.messages.deleteAllMessages(email)
  }

  timeout(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

  async getLatestMessageId(email: string): Promise<string> {
    let checks = 0
    /* eslint-disable no-await-in-loop */
    while (checks < MAX_EMAIL_CHECK) {
      const messages = await this.mailsac.messages.listMessages(email)
      if (messages.data.length > 0) {
        const message = messages.data[0]
        if (!message) {
          throw new Error(`No message found for address ${email}`)
        }
        const id = message._id
        if (!id) {
          throw new Error(`Message id not present for address ${email}`)
        }

        return id
      }
      await this.timeout(EMAIL_CHECK_INTERVAL)
      checks += 1
    }
    throw new Error(`No email found for address ${email}`)
  }

  async getEmailBody(email: string, messageId: string): Promise<string> {
    const result = await this.mailsac.messages.getBodyPlainText(email, messageId)

    return result.data
  }

  isApproveEmail(body: string): boolean {
    return body.includes(EMAIL_APPROVE_BUTTON_TEXT)
  }

  getApproveUrlFromBody(body: string): string {
    const match = body.match(APPROVE_URL_REGEX)
    if (match) {
      return match[0]
    }

    throw new Error(`No url found in email: ${body}`)
  }

  getOtpCodeFromBody(body: string): string {
    const cleanedBody = body.replace(/https:\/\/s1\.designmodo\.com\/postcards\/[^\s]+\s?/gu, '')

    const match = cleanedBody.match(OTP_CODE_REGEX)
    if (match) {
      // Remove empty space in OTP code 111 111
      return match[0].replace(' ', '')
    }

    throw new Error(`No code found in email: ${body}`)
  }

  async getEmailAddressToUse(domain = EMAIL_DOMAIN): Promise<string> {
    const response = await fetch(
      'https://id-allocation-service.walletconnect-v1-bridge.workers.dev/allocate'
    )
    const { id } = await response.json()

    const email = `w3m-w${id}@${domain}`
    // eslint-disable-next-line no-console

    return email
  }

  getSmartAccountEnabledEmail(): string {
    return 'web3modal-smart-account@mailsac.com'
  }
}
