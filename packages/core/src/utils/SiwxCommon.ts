import base58 from 'bs58'
import nacl from 'tweetnacl'

import { SiwxError, SiwxErrorTypes, SiwxMessage } from '@learnweb3dao/siwx-common'
import type { VerificationResponse, VerifyParams } from '@learnweb3dao/siwx-common'
import { ed25519 } from '@noble/curves/ed25519'
import type { TypeSiwx } from './TypeUtil'

export class SiwxMessageCommon extends SiwxMessage<Uint8Array> {
  toMessage(typeSiwx?: TypeSiwx): Uint8Array {
    const messageStr = this._toMessage(typeSiwx ?? 'Ethereum')

    return new TextEncoder().encode(messageStr)
  }

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
      console.log('_error_SiwxCont', error)
      return {
        success: false,
        // error,
        data: this
      }
    }
  }
}

type SignMessage = {
  domain: string
  publicKey: string
  nonce: string
  statement: string
}

export class SigninMessageCustom {
  domain: any
  publicKey: any
  nonce: any
  statement: any

  constructor({ domain, publicKey, nonce, statement }: SignMessage) {
    this.domain = domain
    this.publicKey = publicKey
    this.nonce = nonce
    this.statement = statement
  }

  prepare() {
    return `${this.statement}${this.nonce}`
  }

  async validate(signature: string) {
    const msg = this.prepare()
    const signatureUint8 = base58.decode(signature)
    const msgUint8 = new TextEncoder().encode(msg)
    const pubKeyUint8 = base58.decode(this.publicKey)

    return nacl.sign.detached.verify(msgUint8, signatureUint8, pubKeyUint8)
  }
}
