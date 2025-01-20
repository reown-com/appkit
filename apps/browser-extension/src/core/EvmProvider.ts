import EventEmitter from 'eventemitter3'
import { EIP1193Parameters } from 'viem'

import { createReownTransport } from './transport'

const transport = createReownTransport()

export class EvmProvider extends EventEmitter {
  request({ method, params }: EIP1193Parameters) {
    return transport.send({
      method,
      params
    })
  }
}
