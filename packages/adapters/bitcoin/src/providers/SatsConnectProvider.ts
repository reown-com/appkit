import { ProviderEventEmitter, type ProviderEventEmitterMethods } from './inedx.js'

export interface Provider extends ProviderEventEmitterMethods {
  name: string
  icon?: string
  connect: () => Promise<string>
  disconnect: () => Promise<void>
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  request: <T>(args: T) => Promise<unknown>
}
export class SatsConnectProvider extends ProviderEventEmitter implements Provider {
  public name = 'SatsConnect'

  public async connect() {
    return 'sats-connect'
  }

  public async disconnect() {
    return
  }

  public async signMessage(message: Uint8Array) {
    return message
  }

  public async request<T>(args: T) {
    return args
  }
}
