import { Mailsac } from '@mailsac/api'

const EMAIL_CHECK_INTERVAL = 2500
const MAX_EMAIL_CHECK = 96
const EMAIL_BODY_CHECK_INTERVAL = 2500
const MAX_EMAIL_BODY_CHECK = 3
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
    const startTime = Date.now()
    // eslint-disable-next-line no-console
    console.log(`[getLatestMessageId] Starting to poll for email at ${email}`)

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

        const elapsedTime = Date.now() - startTime
        // eslint-disable-next-line no-console
        console.log(
          `[getLatestMessageId] Found message after ${checks + 1} attempt(s) in ${elapsedTime}ms for ${email}`
        )

        return id
      }
      checks += 1
      // eslint-disable-next-line no-console
      console.log(
        `[getLatestMessageId] Attempt ${checks}/${MAX_EMAIL_CHECK}: No messages yet, waiting ${EMAIL_CHECK_INTERVAL}ms...`
      )
      await this.timeout(EMAIL_CHECK_INTERVAL)
    }

    const elapsedTime = Date.now() - startTime
    throw new Error(
      `No email found for address ${email} after ${MAX_EMAIL_CHECK} attempts (${elapsedTime}ms)`
    )
  }

  async getEmailBody(email: string, messageId: string): Promise<string> {
    const startTime = Date.now()
    // eslint-disable-next-line no-console
    console.log(`[getEmailBody] Fetching email body for ${email}, messageId: ${messageId}`)

    let checks = 0
    let lastError: unknown = null

    /* eslint-disable no-await-in-loop */
    while (checks < MAX_EMAIL_BODY_CHECK) {
      try {
        const result = await this.mailsac.messages.getBodyPlainText(email, messageId)
        const elapsedTime = Date.now() - startTime
        // eslint-disable-next-line no-console
        console.log(
          `[getEmailBody] Successfully fetched email body after ${checks + 1} attempt(s) in ${elapsedTime}ms`
        )

        return String(result.data)
      } catch (error) {
        lastError = error
        checks += 1

        // Extract error details for logging
        const errorMessage = error instanceof Error ? error.message : String(error)
        const statusCode = (error as { response?: { status?: number } })?.response?.status
        const responseData = (error as { response?: { data?: unknown } })?.response?.data

        // eslint-disable-next-line no-console
        console.log(
          `[getEmailBody] Attempt ${checks}/${MAX_EMAIL_BODY_CHECK} failed for ${email}, messageId: ${messageId}`
        )
        // eslint-disable-next-line no-console
        console.log(`[getEmailBody] Error: ${errorMessage}`)
        if (statusCode) {
          // eslint-disable-next-line no-console
          console.log(`[getEmailBody] HTTP Status: ${statusCode}`)
        }
        if (responseData) {
          // eslint-disable-next-line no-console
          console.log(`[getEmailBody] Response data:`, responseData)
        }

        if (checks < MAX_EMAIL_BODY_CHECK) {
          // eslint-disable-next-line no-console
          console.log(`[getEmailBody] Retrying in ${EMAIL_BODY_CHECK_INTERVAL}ms...`)
          await this.timeout(EMAIL_BODY_CHECK_INTERVAL)
        }
      }
    }

    // All retries exhausted
    const errorMessage = lastError instanceof Error ? lastError.message : String(lastError)
    const statusCode = (lastError as { response?: { status?: number } })?.response?.status
    const statusPart = statusCode ? `, HTTP Status: ${statusCode}` : ''

    throw new Error(
      `Failed to fetch email body after ${MAX_EMAIL_BODY_CHECK} attempts. Email: ${email}, MessageId: ${messageId}, Last error: ${errorMessage}${statusPart}`
    )
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
