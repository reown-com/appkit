import { W3aCtrl } from '../controllers/W3aCtrl'

export interface BaseMessage {
  MAGIC_NUMBER: typeof MAGIC_NUMBER
  reply: string
}

export type Params =
  | { method: 'getAddress' }
  | { method: 'isLoggedIn' }
  | { method: 'logout' }
  | { method: 'request'; args: unknown[] }
  | { method: 'sendEmailVerification'; email: string }
  | { method: 'verifyEmail'; code: string }
export type Message = BaseMessage & Params

export const IFRAME_ID = 'walletconnect-web3account-iframe'

export const IFRAME_API = 'https://web3account-iframe.pages.dev'

export const IS_SERVER = typeof window === 'undefined'

export const MAGIC_NUMBER = 'f41ef320-9a42-43c2-87d6-7be2a21b6400'

export function messageHandler(e: MessageEvent) {
  if (e.origin === IFRAME_API) {
    W3aCtrl.state.iFrameReady = true
    for (const notifyReady of W3aCtrl.state.notifyReady) {
      notifyReady()
    }
    window.removeEventListener('message', messageHandler)
  }
}

export function isBaseMessage(data: { MAGIC_NUMBER: typeof MAGIC_NUMBER }): data is BaseMessage {
  try {
    if (data.MAGIC_NUMBER === MAGIC_NUMBER) {
      return true
    }

    return false
  } catch (e) {
    return false
  }
}

export async function call<T>(msg: Params): Promise<BaseMessage & T> {
  const reply = W3aCtrl.getReply()

  const promise = new Promise<BaseMessage & T>((resolve, _reject) => {
    function baseMessageHandler({ origin, data }: MessageEvent) {
      if (!isBaseMessage(data)) {
        return
      }
      if (origin !== IFRAME_API) {
        return
      }
      if (data.reply !== reply) {
        return
      }
      window.removeEventListener('message', baseMessageHandler)
      resolve(data as BaseMessage & T)
    }
    window.addEventListener('message', baseMessageHandler)
  })

  const message: Message = {
    MAGIC_NUMBER,
    reply,
    ...msg
  }

  W3aCtrl.postMessage(message)

  return promise
}
