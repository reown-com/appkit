import { ConstantsUtil } from '@web3modal/scaffold-utils'

import { Web3Modal } from '../src/client.js'

import type { Web3ModalOptions } from '../src/client.js'
import type { ScaffoldOptions } from "@web3modal/scaffold"

export type { Web3ModalOptions } from '../src/client.js'

export function createWeb3Modal(options: Web3ModalOptions) {
    return new Web3Modal({ ...options as ScaffoldOptions, _sdkVersion: `html-solana-${ConstantsUtil.VERSION}` })
}
