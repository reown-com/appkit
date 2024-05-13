import { Injected } from './injected.js'
import {
  W3mFrameProvider,
  W3mFrameHelpers,
  W3mFrameRpcConstants,
  W3mFrameConstants
} from '@web3modal/wallet'

export class EmailConnector extends Injected {
  private emailProvider?: W3mFrameProvider

  constructor() {
    super({ id: options.info.rdns, type: 'ANNOUNCED', getProvider: () => options.provider })
    this.info = options.info
    this.name = options.info.name
    this.imageUrl = options.info.icon
  }
}
