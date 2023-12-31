import { Mailsac, type EmailMessage } from '@mailsac/api'

export class Email {
  private readonly mailsac: Mailsac<any>
  private messageCount: any
  constructor(public readonly apiKey: string) {
    this.mailsac = new Mailsac({ headers: {  "Mailsac-Key": apiKey } })
    this.messageCount = undefined
  }

  async deleteAllMessages(email: string) {
    this.messageCount = 0
    return await this.mailsac.messages.deleteAllMessages(email)
  }

  async getNewMessage(email: string) {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject('timeout')
      }, 15000)
    })

    const messagePoll = new Promise((resolve) => {
      const interval = setInterval(async () => {
        const messages = await this.mailsac.messages.listMessages(email)
        if (messages.data.length > this.messageCount) {
          clearInterval(interval)
          this.messageCount = messages.data.length
          const message = messages.data[0] as EmailMessage
          return resolve(message)
        }
      }, 500)
    })

    return Promise.any([timeout, messagePoll])
  }

  async getCodeFromEmail(email: string, messageId: string) {
    const result = await this.mailsac.messages.getBodyPlainText(email, messageId)

    if (result.data.includes('Approve this login')) {
      // Get the register.web3modal.com device registration URL
      const regex = /https:\/\/register.*/
      const match = result.data.match(regex)
      if (match) {
        return match[0]
      } else {
        throw new Error('No url found in email: ' + result.data)
      }
    }

    const otpRegex = /\d{3}\s?\d{3}/
    const match = result.data.match(otpRegex)
    if (match) {
      return match[0].replace(/\s/g, '')
    } else {
      throw new Error('No code found in email: ' + result.data)
    }
  }
}
