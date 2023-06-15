import { proxy, ref, subscribe as valtioSub } from 'valtio/vanilla'
import type { W3aCtrlState } from '../types/controllerTypes'
import { IFRAME_API, IFRAME_ID, IS_SERVER, call, messageHandler } from '../utils/W3aUtil'

// -- initial state ------------------------------------------------ //
const state = proxy<W3aCtrlState>({
  iFrameMsgIndex: 0,
  iFrameReady: false,
  providerInited: false,
  iFrame: null as unknown as HTMLIFrameElement,
  notifyReady: [] as (() => void)[]
})

// -- controller --------------------------------------------------- //
export const W3aCtrl = {
  state,

  subscribe(callback: (newState: W3aCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  setIFrame() {
    if (IS_SERVER) {
      state.iFrame = null as unknown as HTMLIFrameElement
    } else {
      const existingIFrame = document.getElementById(IFRAME_ID)
      if (existingIFrame) {
        existingIFrame.remove()
      }
      const iFrame = document.createElement('iframe')
      iFrame.id = IFRAME_ID
      iFrame.name = IFRAME_ID
      iFrame.style.display = 'none'
      iFrame.src = IFRAME_API

      window.addEventListener('message', messageHandler)
      state.iFrame = ref(iFrame)
      document.body.append(iFrame)
    }
  },

  async postMessage(message: unknown): Promise<void> {
    function post(contentWindow: Window | null) {
      if (!contentWindow) {
        throw new Error('iframe.contentWindow is null')
      }
      contentWindow.postMessage(message, IFRAME_API)
    }

    if (state.iFrameReady) {
      post(state.iFrame.contentWindow)

      return Promise.resolve()
    }

    return new Promise<void>(resolve => {
      state.notifyReady.push(() => {
        if (state.iFrameReady) {
          post(state.iFrame.contentWindow)
          resolve()
        } else {
          throw new Error('this.iframe.contentWindow still null after notifyReady was called')
        }
      })
    })
  },

  getReply(): string {
    const reply = `${state.iFrameMsgIndex}`
    state.iFrameMsgIndex += 1

    return reply
  },

  async isAuthorized(): Promise<boolean> {
    return call<{ isLoggedIn: boolean }>({ method: 'isLoggedIn' }).then(msg => msg.isLoggedIn)
  },

  async disconnect(): Promise<void> {
    return call({ method: 'logout' })
  },

  async sendEmailVerification(email: string): Promise<void> {
    return call<{ error: string | undefined }>({
      method: 'sendEmailVerification',
      email
    }).then(msg => {
      if (msg.error) {
        throw new Error(msg.error)
      }
    })
  },

  async verifyEmail(code: string): Promise<boolean> {
    return call<{ error: string } | { error: undefined; verified: boolean }>({
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
