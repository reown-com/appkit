import type { BaseMessage, Message, Params } from './MessageUtil'
import { MAGIC_NUMBER, isBaseMessage } from './MessageUtil'

export interface Eip1193Provider {
  request: (params: unknown[]) => Promise<unknown>
}

const IFRAME_ID = 'walletconnect-web3account-iframe'
const IFRAME_API = 'https://web3account-iframe.pages.dev'
export const IS_SERVER = typeof window === 'undefined'

export const W3aUtil = {
  iframeMsgIndex: 0,
  iframeReady: false,
  providerInited: false,
  iframe: null as unknown as HTMLIFrameElement,
  notifyReady: [] as (() => void)[],

  initIFrame() {
    if (IS_SERVER) {
      this.iframe = null as unknown as HTMLIFrameElement
    } else {
      const existingIframe = document.getElementById(IFRAME_ID)
      if (existingIframe) {
        existingIframe.remove()
      }
      const iframe = document.createElement('iframe')
      iframe.id = IFRAME_ID
      iframe.name = IFRAME_ID
      iframe.style.display = 'none'
      iframe.src = IFRAME_API

      // Watch for iframe to be ready
      const messageHandler = (e: MessageEvent) => {
        if (e.origin === IFRAME_API) {
          this.iframeReady = true
          for (const notifyReady of this.notifyReady) {
            notifyReady()
          }
          window.removeEventListener('message', messageHandler)
        }
      }
      window.addEventListener('message', messageHandler)

      document.body.append(iframe)
      this.iframe = iframe
    }
  },

  async postMessage(message: unknown): Promise<void> {
    function post(contentWindow: Window | null) {
      if (!contentWindow) {
        throw new Error('iframe.contentWindow is null')
      }
      contentWindow.postMessage(message, IFRAME_API)
    }

    if (this.iframeReady) {
      post(this.iframe.contentWindow)

      return Promise.resolve()
    }

    return new Promise<void>(resolve => {
      this.notifyReady.push(() => {
        if (this.iframeReady) {
          post(this.iframe.contentWindow)
          resolve()
        } else {
          throw new Error('this.iframe.contentWindow still null after notifyReady was called')
        }
      })
    })
  },

  getReply(): string {
    const reply = `${this.iframeMsgIndex}`
    this.iframeMsgIndex += 1

    return reply
  },

  async call<T>(msg: Params): Promise<BaseMessage & T> {
    const reply = this.getReply()

    const promise = new Promise<BaseMessage & T>((resolve, _reject) => {
      function messageHandler({ origin, data }: MessageEvent) {
        if (!isBaseMessage(data)) {
          return
        }
        if (origin !== IFRAME_API) {
          return
        }
        if (data.reply !== reply) {
          return
        }
        window.removeEventListener('message', messageHandler)
        resolve(data as BaseMessage & T)
      }
      window.addEventListener('message', messageHandler)
    })

    const message: Message = {
      MAGIC_NUMBER,
      reply,
      ...msg
    }
    this.postMessage(message)

    return promise
  },

  async isAuthorized(): Promise<boolean> {
    return this.call<{ isLoggedIn: boolean }>({ method: 'isLoggedIn' }).then(msg => msg.isLoggedIn)
  },

  async disconnect(): Promise<void> {
    return this.call({ method: 'logout' })
  },

  async sendEmailVerification(email: string): Promise<void> {
    return this.call<{ error: string | undefined }>({
      method: 'sendEmailVerification',
      email
    }).then(msg => {
      if (msg.error) {
        throw new Error(msg.error)
      }
    })
  },

  async verifyEmail(code: string): Promise<boolean> {
    return this.call<{ error: string } | { error: undefined; verified: boolean }>({
      method: 'verifyEmail',
      code
    }).then(msg => {
      if (msg.error === undefined) {
        return msg.verified
      }
      throw new Error(msg.error)
    })
  }
}
