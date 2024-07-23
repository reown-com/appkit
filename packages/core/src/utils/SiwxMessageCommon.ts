import base58 from 'bs58'

import { SiwxError, SiwxErrorTypes, SiwxMessage } from '@learnweb3dao/siwx-common'
import type { VerificationResponse, VerifyParams } from '@learnweb3dao/siwx-common'
import * as ed25519 from '@noble/ed25519'
import type { TypeSiwx } from './TypeUtil.ts'

export class SiwxMessageCommon extends SiwxMessage<Uint8Array> {
  toMessage(typeSiwx?: TypeSiwx): Uint8Array {
    const messageStr = this._toMessage(typeSiwx ?? 'Ethereum')

    return new TextEncoder().encode(messageStr)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async verify(params: VerifyParams): Promise<VerificationResponse<Uint8Array>> {
    try {
      const { signature } = params

      this._verify(params)

      const message = this.toMessage()
      const signatureU8 = base58.decode(signature)
      const publicKeyU8 = base58.decode(this.address)

      const verifyResult = ed25519.verify(signatureU8, message, publicKeyU8)

      if (!verifyResult) {
        throw new SiwxError(
          SiwxErrorTypes.INVALID_SIGNATURE,
          `Signature does not match address ${this.address}`
        )
      }

      return {
        success: true,
        data: this
      }
    } catch (error) {
      return {
        success: false,
        data: this
      }
    }
  }
}
