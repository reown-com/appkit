import type { Provider } from '../utils/EthersTypesUtil.js'
import { Injected } from './injected.js'

type EIP6963Options = {
  info: {
    uuid: string
    name: string
    icon: string
    rdns: string
  }
  provider: Provider
}

export class EIP6963Connector extends Injected {
  info: {
    uuid: string
    name: string
    icon: string
    rdns: string
  }
  name: string
  imageUrl: string

  constructor(options: EIP6963Options) {
    super({ id: options.info.rdns, type: 'ANNOUNCED', getProvider: () => options.provider })
    this.info = options.info
    this.name = options.info.name
    this.imageUrl = options.info.icon
  }
}
