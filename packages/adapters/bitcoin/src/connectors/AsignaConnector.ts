import { type CaipNetwork, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { CoreHelperUtil, type RequestArguments } from '@reown/appkit-controllers'
import { PresetsUtil } from '@reown/appkit-utils'
import { bitcoin } from '@reown/appkit/networks'

import { MethodNotSupportedError } from '../errors/MethodNotSupportedError.js'
import type { BitcoinConnector } from '@reown/appkit-utils/bitcoin'
import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'
import { AddressPurpose } from '../utils/BitcoinConnector.js'
import { AsignaUiHelper } from '../utils/AsignaUiHelper.js'

export class AsignaConnector extends ProviderEventEmitter implements BitcoinConnector {
  public readonly id = 'Asigna'
  public readonly name = 'Asigna Wallet'
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'
  public readonly explorerId =
    PresetsUtil.ConnectorExplorerIds[CommonConstantsUtil.CONNECTOR_ID.ASIGNA]
  public readonly imageUrl: string

  public readonly provider = this

  private readonly requestedChains: CaipNetwork[] = []
  private multisigInfo: { threshold: number; users: string[]; address: string } | undefined

  constructor({
    requestedChains,
    imageUrl
  }: AsignaConnector.ConstructorParams) {
    super()
    this.requestedChains = requestedChains
    this.imageUrl = imageUrl
  }

  public get chains() {
    return this.requestedChains.filter(chain => chain.caipNetworkId === bitcoin.caipNetworkId)
  }

  public async connect(): Promise<string> {
    interface ConnectResponse {
      threshold: number
      users: string[]
      address: string
      psbtInputConstructionFields: any
    }
    
    const response = await this.sendMessageAndWait<ConnectResponse>(
      { connect: true },
      'psbtInputConstructionFields',
      (data) => data.psbtInputConstructionFields && data.threshold && data.users && data.address
    )
    
    this.multisigInfo = {
      threshold: response.threshold,
      users: response.users,
      address: response.address
    }
    
    this.emit('accountsChanged', [response.address])
    return response.address
  }

  public async disconnect(): Promise<void> {
    return Promise.resolve();
  }

  public async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    interface AccountResponse {
      address: string
      psbtInputConstructionFields: any
    }
    
    const response = await this.sendMessageAndWait<AccountResponse>(
      { connect: true },
      'psbtInputConstructionFields',
      (data) => data.psbtInputConstructionFields && data.address
    )
    
    return [{
      address: response.address,
      purpose: AddressPurpose.Payment,
      publicKey: ''
    }]
  }

  private async pollSignatureStatus(
    mode: 'message' | 'transaction',
    data: any,
    updateProgress: (current: number, total: number) => void,
    collectedSignaturesRef: { signatures: any[]; initialPsbt?: string },
    onComplete?: (result: any) => void
  ): Promise<void> {
    const totalSignatures = this.multisigInfo?.threshold || 2
    
    return new Promise<void>((resolve) => {
      let currentSignatures = 0
      const statusInterval = setInterval(async () => {
        try {
          if (mode === 'message') {
            const status = await this.sendMessageAndWait<{messageInfo: any}>(
              { messageInfo: data.message },
              'messageInfo',
              (data) => data.messageInfo && data.messageInfo.signatures
            )
            if (status.messageInfo && status.messageInfo.signatures) {
              currentSignatures = status.messageInfo.signatures.length
              updateProgress(currentSignatures, totalSignatures)
              if (collectedSignaturesRef) {
                collectedSignaturesRef.signatures = status.messageInfo.signatures
              }
              if (currentSignatures >= totalSignatures) {
                clearInterval(statusInterval)
                if (onComplete) {
                  const mergedSignature = collectedSignaturesRef.signatures.map((sig: any) => sig.signature).join(',')
                  onComplete(mergedSignature)
                }
                resolve()
              }
            }
          } else {
            const txId = data.getTxId ? data.getTxId() : data.txid
            const isTxCreated = data.isTxCreated ? data.isTxCreated() : false
            if (!isTxCreated) {
              return
            }
            if (!txId) {
              return
            }
            const status = await this.sendMessageAndWait<{transactionInfo: any}>(
              { transactionInfo: txId },
              'transactionInfo',
              (data) => data.transactionInfo && data.transactionInfo.signatures
            )
            if (status.transactionInfo && status.transactionInfo.signatures) {
              currentSignatures = status.transactionInfo.signatures.length
              updateProgress(currentSignatures, totalSignatures)
              if (collectedSignaturesRef) {
                collectedSignaturesRef.signatures = status.transactionInfo.signatures
                if (status.transactionInfo.initialPsbt) {
                  collectedSignaturesRef.initialPsbt = status.transactionInfo.initialPsbt
                }
              }
              if (currentSignatures >= totalSignatures) {
                clearInterval(statusInterval)
                if (onComplete) {
                  onComplete(txId)
                }
                resolve()
              }
            }
          }
        } catch (error) {
        }
      }, 5000)
    })
  }

  private async signWithModal<T>(
    mode: 'message' | 'transaction',
    data: any,
    onApprove?: (result: T) => void
  ): Promise<T> {
    let modal: HTMLElement | null = null
    let updateProgress: (current: number, total: number) => void = () => {}
    try {
      const collectedSignaturesRef = { signatures: [] as any[], initialPsbt: undefined as string | undefined }
      
      let approveResolve: ((value: T) => void) | null = null
      const approvePromise = new Promise<T>((resolve) => {
        approveResolve = resolve
      })
      
      const modalResult = AsignaUiHelper.createSigningModal(mode, {
        ...data,
        threshold: this.multisigInfo?.threshold || 2,
        collectedSignaturesRef: collectedSignaturesRef
      }, (result: T) => {
        if (approveResolve) {
          approveResolve(result)
        }
        if (onApprove) {
          onApprove(result)
        }
      })
      modal = modalResult.modal
      updateProgress = modalResult.updateProgress
      document.body.appendChild(modal)
      
      requestAnimationFrame(() => {
        modal!.style.opacity = '1'
        modal!.querySelector('.modal-content')?.classList.add('show')
      })
      
      let isCancelled = false
      const cancelPromise = new Promise<never>((_, reject) => {
        const cancelButton = modal!.querySelector('.cancel-button') as HTMLButtonElement
        if (cancelButton) {
          cancelButton.addEventListener('click', () => {
            isCancelled = true
            reject(new Error('Operation cancelled by user'))
          })
        }
      })
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Signature timeout expired'))
        }, 25 * 60 * 1000)
      })
      
      this.pollSignatureStatus(mode, data, updateProgress, collectedSignaturesRef, data.onComplete)
      
      const result = await Promise.race([
        approvePromise,
        cancelPromise,
        timeoutPromise
      ])
      if (isCancelled) {
        throw new Error('Operation cancelled by user')
      }
      return result
    } catch (error) {
      throw error
    } finally {
      if (modal) {
        modal.style.opacity = '0'
        modal.querySelector('.modal-content')?.classList.remove('show')
        setTimeout(() => {
          if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal)
          }
        }, 200)
      }
    }
  }

  public async signMessage(params: BitcoinConnector.SignMessageParams): Promise<string> {
    setTimeout(async () => {
      try {
        await this.sendMessageAndWait(
          { message: params.message },
          'signature',
          (data) => data.signature
        )
      } catch (error) {
        console.error('Error sending sign message request:', error)
      }
    }, 100)
    
    return this.signWithModal('message', {
      message: params.message,
      protocol: params.protocol || 'ecdsa',
      onComplete: (_result: string) => {}
    }, (result) => {
      return result
    })
  }

  public async signPSBT(
    params: BitcoinConnector.SignPSBTParams
  ): Promise<BitcoinConnector.SignPSBTResponse> {
    setTimeout(async () => {
      try {
        await this.sendMessageAndWait(
          {
            signPsbt: {
              psbt: params.psbt,
              signInputs: params.signInputs,
              broadcast: params.broadcast
            }
          },
          'signedPsbt',
          (data) => data.signedPsbt && data.txid
        )
      } catch (error) {
        console.error('Error sending sign PSBT request:', error)
      }
    }, 100)
    
    return this.signWithModal('transaction', {
      psbt: params.psbt,
      signInputs: params.signInputs,
      broadcast: params.broadcast,
      onComplete: (_result: string) => {
      }
    }, (result) => {
      const response = {
        psbt: result.psbt,
        txid: undefined
      }
      
      if (params.broadcast && result.psbt) {
        return this.broadcastPSBT(result.psbt).then(txid => ({
          ...response,
          txid
        }))
      }
      
      return response
    })
  }

  public async sendTransfer(params: BitcoinConnector.SendTransferParams): Promise<string> {
    let txIdFromResponse: string | null = null 
    let isTxCreated = false
    
    setTimeout(async () => {
      try {
        const response = await this.sendMessageAndWait<{txIdBtc: string}>(
          {
            btcAmount: params.amount,
            type: 'SIGNATURE',
            recipient: params.recipient
          },
          'txIdBtc',
          (data) => data.txIdBtc
        )
        txIdFromResponse = response.txIdBtc
        isTxCreated = true
      } catch (error) {
        console.error('Error sending BTC transfer request:', error)
      }
    }, 100)
    
    return new Promise<string>(async (resolve, reject) => {
      try {
        const result = await this.signWithModal<string>('transaction', {
          amount: params.amount,
          recipient: params.recipient,
          type: 'SIGNATURE',
          getTxId: () => txIdFromResponse,
          isTxCreated: () => isTxCreated,
          onComplete: (_result: string) => {}
        }, (result) => {
          return result
        })
        
        const txHex = result
        if (txHex) {
          const txId = await this.broadcastPSBT(txHex)
          resolve(txId)
        } else {
          reject(new Error('No transaction hex to broadcast'))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  public async switchNetwork(_caipNetworkId: string): Promise<void> {
    throw new Error(`${this.name} wallet does not support network switching`)
  }

  public request<T>(_args: RequestArguments): Promise<T> {
    return Promise.reject(new MethodNotSupportedError(this.id, 'request'))
  }

  public static getWallet(params: AsignaConnector.GetWalletParams): AsignaConnector | undefined {
    if (!CoreHelperUtil.isClient()) {
      return undefined
    }

    const imageUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzAwMDEwMCIgZD0iTTAgMGgzMnYzMkgweiIvPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0xNS4xMSA1LjU1YTMgMyAwIDAgMC0xLjgyIDEuM2wtLjA1LjA4LS40My43Mi0uMDcuMTEtLjUuODUtLjA1LjA5LTEuMjkgMi4xOC0uMDQuMDctLjQ3LjgtLjA2LjEtLjQ2Ljc4LS4wNy4xMS0xLjYzIDIuNzYtLjA3LjExLS4zOC42Ni0uMDUuMDgtLjczIDEuMjQtLjM1LjYtLjQuNjctLjA1LjA5TDUuMSAyMC43bC0uMTEuMTgtLjE0LjIzLS4wNy4xMy0uMzMuNTUtLjA0LjA3di4wMWExLjI2IDEuMjYgMCAwIDAtLjE0LjQ3IDEuMzEgMS4zMSAwIDAgMCAxLjI0IDEuNGgxLjVsLjA1LS4wNi4wNC0uMDYuODctMS4yMS4wNS0uMDguNzctMS4wNy4wNS0uMDcuNC0uNTcuMDUtLjA2LjI0LS4zNGExLjUyIDEuNTIgMCAwIDEgMS4zOS0uNjIgMS41IDEuNSAwIDAgMSAuNjQuMiAxLjQ3IDEuNDcgMCAwIDEgLjczIDEuMjcgMS40NCAxLjQ0IDAgMCAxLS4yNy44NGwtLjYzLjg4LS4wNS4wNy0uMzIuNDUtLjA2LjA4LS4wOC4xMi0uMTIuMTYtLjA1LjA4aDIuMTNhMi4zMiAyLjMyIDAgMCAwIDEuNzctLjk2bDEuMTgtMS42My43Ny0xLjA4IDEuMy0xLjhhMS4yNCAxLjI0IDAgMCAxIC41NS0uNDNsLjA4LS4wM2ExLjMgMS4zIDAgMCAxIC4zLS4wNiAxLjI4IDEuMjggMCAwIDEgMS4xNS41NGwuMTEuMmExLjEzIDEuMTMgMCAwIDEgLjEuNDEgMS4xOSAxLjE5IDAgMCAxLS4yMy43N2wtLjAzLjA1LS41Ny44LS43Ljk4LS4yNy4zN2ExLjIyIDEuMjIgMCAwIDAtLjIuNSAxLjA1IDEuMDUgMCAwIDAtLjAyLjIzdi4wNmExLjE3IDEuMTcgMCAwIDAgLjE0LjQzbC4wMi4wNS4wNy4xYTEuNDQgMS40NCAwIDAgMCAuMS4xMWwuMDUuMDYuMDEuMDFhMS44IDEuOCAwIDAgMCAuMTQuMWMwIC4wMi4wMi4wMy4wNC4wM2ExIDEgMCAwIDAgLjA4LjA1bC4wNy4wNGExLjI1IDEuMjUgMCAwIDAgLjUuMWg2LjljLjEgMCAuMi0uMDEuMjktLjAzbC4wNi0uMDJhMS4yNyAxLjI3IDAgMCAwIC4yNy0uMS41Ny41NyAwIDAgMCAuMDctLjAzIDEuMjEgMS4yMSAwIDAgMCAuMjYtLjE5bC4wOC0uMDdhLjkyLjkyIDAgMCAwIC4xNS0uMTkgMS41NSAxLjU1IDAgMCAwIC4wOS0uMTdsLjAyLS4wNWExLjIyIDEuMjIgMCAwIDAgLjA4LS4yNnYtLjA0bC4wMi0uMDh2LS4wOGExLjMyIDEuMzIgMCAwIDAtLjItLjc0bC0xLjYtMi42NC0uMDYtLjEtLjItLjMyLS4zMy0uNTR2LS4wMWwtLjA1LS4wOC0xLjMtMi4xNS0uMDctLjEtLjA0LS4wNi0uOC0xLjMyLS4wNC0uMDctLjItLjM0LS4xLS4xNC0uMS0uMTYtLjUzLS45LS4xMy0uMi0uMDktLjE0LTIuMTctMy41Ny0uMDQtLjA3LS43Mi0xLjE5LS4wNS0uMDctLjQtLjY1YTIuNjUgMi42NSAwIDAgMC0uMy0uNCAyLjk2IDIuOTYgMCAwIDAtLjk3LS43NCAzLjA0IDMuMDQgMCAwIDAtMS4zLS4zYy0uMjUgMC0uNS4wNC0uNzQuMVoiLz48cGF0aCBmaWxsPSJ1cmwoI2IpIiBkPSJNMTkgMTYuM2E1LjQ1IDUuNDUgMCAwIDAtLjgzIDEuNTZsLS4wNC4xNWExLjM2IDEuMzYgMCAwIDEgLjI4LS4xNiAxLjI0IDEuMjQgMCAwIDEgLjM4LS4wOGguMWExLjI4IDEuMjggMCAwIDEgMS4wNS41NGMuMDQuMDYuMDguMTMuMS4yYTEuMjQgMS4yNCAwIDAgMSAuMDkuMjcgMS4xOSAxLjE5IDAgMCAxLS4yLjkxbC0uMDQuMDUtLjU3Ljc5LS43Ljk5LS4yNy4zN2ExLjIzIDEuMjMgMCAwIDAtLjIuNDIgMS4wNiAxLjA2IDAgMCAwLS4wMi4zMXYuMDZhMS4xNyAxLjE3IDAgMCAwIC4xNi40Ny45My45MyAwIDAgMCAuMDcuMSAxLjUgMS41IDAgMCAwIC4xLjEybC4wNS4wNmguMDFhMS45NCAxLjk0IDAgMCAwIC4wOS4wOCAxIDEgMCAwIDAgLjE3LjFsLjA3LjA0YTEuMjUgMS4yNSAwIDAgMCAuNS4xaDYuOWMuMSAwIC4yIDAgLjI4LS4wMmwuMDctLjAyYTEuMzIgMS4zMiAwIDAgMCAuMzQtLjEzbC4xNi0uMS4wMy0uMDNhMS4yOSAxLjI5IDAgMCAwIC4yLS4yIDIuNDMgMi40MyAwIDAgMCAuMTItLjE3Yy4wMy0uMDMuMDUtLjA4LjA3LS4xMmwuMDItLjA1YTEuMjEgMS4yMSAwIDAgMCAuMDktLjN2LS4wOGwuMDEtLjA5YTEuMzIgMS4zMiAwIDAgMC0uMi0uNzNsLTEuNi0yLjY0LS4wNi0uMS0uMi0uMzItLjMzLS41NHYtLjAybC0uMDUtLjA3LTEuMy0yLjE1LS4xMi0uMDctLjA3LS4wNGE0Ljk0IDQuOTQgMCAwIDAtMi40Ni0uNjdjLTEuMDMgMC0xLjc2LjU3LTIuMjYgMS4yWiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xMi4yOSAyMS4wOGMwIC4yOS0uMDkuNTgtLjI3Ljg0bC0xLjMxIDEuODRIN2wyLjUyLTMuNTNhMS41NCAxLjU0IDAgMCAxIDIuMS0uMzZjLjQzLjI4LjY2Ljc0LjY2IDEuMloiLz48cGF0aCBmaWxsPSIjMDAwIiBkPSJNMTEuMTYgMjEuMjVhLjU2LjU2IDAgMCAxLS41Ny41NS41Ni41NiAwIDAgMS0uNTctLjU2LjU2LjU2IDAgMCAxIC41Ny0uNTUuNTYuNTYgMCAwIDEgLjU3LjU2WiIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDE9IjE1LjIzIiB4Mj0iMTkuMyIgeTE9IjI1Ljc4IiB5Mj0iNi4xMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiM2NTIyRjQiLz48c3RvcCBvZmZzZXQ9Ii41NSIgc3RvcC1jb2xvcj0iIzlCNkJGRiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0E1ODVGRiIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJiIiB4MT0iMjIuNTkiIHgyPSIyNC44IiB5MT0iMjQuNzEiIHkyPSIxNS41MyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiM0MjFGOEIiLz48c3RvcCBvZmZzZXQ9Ii41NSIgc3RvcC1jb2xvcj0iIzcyMzBGRiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzk3NzNGRiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==';

    if (window.top !== window.self) {
      return new AsignaConnector({
        imageUrl,
        ...params
      })
    }

    return undefined
  }

  public async getPublicKey(): Promise<string> {
    throw new Error('Method not implemented')
  }

  private async sendMessageAndWait<T>(
    message: any, 
    expectedResponse: string,
    responseValidator?: (data: any) => boolean
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const handleMessage = (e: MessageEvent) => {
        if (e.data.source === 'asigna') {
          if (e.data.data.error) {
            window.removeEventListener('message', handleMessage)
            reject(new Error(e.data.data.error))
            return
          }
          
          if (e.data.data[expectedResponse] || (responseValidator && responseValidator(e.data.data))) {
            window.removeEventListener('message', handleMessage)
            resolve(e.data.data)
            return
          }
        }
      }
      
      window.addEventListener('message', handleMessage)
      window.top?.postMessage({ source: 'asigna-sdk', ...message }, '*')
    })
  }

  public async broadcastPSBT(psbt: string): Promise<string> {
    try {
      const response = await this.sendMessageAndWait<{txid: string}>(
        {
          broadcastPsbt: {
            psbt: psbt
          }
        },
        'txid',
        (data) => data.txid
      )
      
      return response.txid
    } catch (error) {
      console.error('Error broadcasting PSBT:', error)
      throw new Error(`Failed to broadcast PSBT: ${error}`)
    }
  }
}

export namespace AsignaConnector {
  export type ConstructorParams = {
    requestedChains: CaipNetwork[]
    imageUrl: string
  }

  export type Wallet = {
    connect(): Promise<{ address: string; publicKey: string }>
    disconnect(): Promise<void>
    getAccounts(): Promise<string[]>
    signMessage(signStr: string, type?: 'ecdsa' | 'bip322-simple'): Promise<string>
    signPsbt(psbtHex: string): Promise<string>
    pushPsbt(psbtHex: string): Promise<string>
    send(params: {
      from: string
      to: string
      value: string
      satBytes?: string
      memo?: string
      memoPos?: number
    }): Promise<{ txhash: string }>
    on(event: string, listener: (param?: unknown) => void): void
    removeAllListeners(): void
    getPublicKey(): Promise<string>
  }

  export type GetWalletParams = Omit<ConstructorParams, 'wallet' | 'imageUrl'>
} 