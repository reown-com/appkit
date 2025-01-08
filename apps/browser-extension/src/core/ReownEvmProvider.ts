import { EIP1193Parameters } from 'viem'
import { createReownTransport } from './transport'
import EventEmitter from 'eventemitter3'

const transport = createReownTransport()

export class ReownEvmProvider extends EventEmitter {
  request({ method, params }: EIP1193Parameters) {
    return transport.send({
      method,
      params
    })
  }
}
