import { type CaipNetwork, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { CoreHelperUtil, type RequestArguments } from '@reown/appkit-controllers'
import { PresetsUtil } from '@reown/appkit-utils'
import { bitcoin } from '@reown/appkit/networks'

import { MethodNotSupportedError } from '../errors/MethodNotSupportedError.js'
import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
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

    const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAIABJREFUeJylfXusZtdV32+d787MnZfnTmzPeOw4nonf9jh2HNs4ttNk8sIBJ3ESGjsJiUkgKhEUOYWqqloJUCsQUlXFVFBVhKdKS1FRjCgUKCFJVVpAKQmiBfKekOA4sZ25fs1cz73fXv3j7LXWb61z7iQ0x77zfd85++yz93r+1tqPI/gmj7W1tbUFdtyraC9XkZugOCoyrCkAAfxf0HcBABGIXyufku8TyPhTx/tqff1CL6LpvgaNW9N1Lfdvd8jsOSk1cC0yuUf934GfptobpVFCp/cBLc6opisCutfv0rFuYB2Ck6r6SQAfA5YPr6+vr5+js+fsdTrW1taODlg8qMADgKzl28T+7+eIJJ254+9h+ki/Lp3fMkPQb+5gWmZWx7+yDfuzaFmZqUjPHX/31vb2aItfqpPrQPMGaReaaGcItpJgYSLq+kvA8sfX19dP/n/1YW1tbQ0YflQwPFg1wJlNGuyMtOtC4iBD9E+QhEVEihUAdBvNq2QSKfQjAn0jnd9OICblJg+ZJ9mcLZi3SNRKVbpiVoEtl1kN7cLAtWvUxO0Tq8qp9AFg68e3swizvVlbWzsqWHwEkKOFGsXwSWIYn4Mztmo8QgCkappsS2B/vnVWOlmVTvutGh9idFQnzrZPIIG2ep3y4hV1oWCaVJOOGRELhtkVTa5Bc7u9ERraXh2AAiJkCeycd92F6yTQTsxZgwkt1tbWbgKGDwmGo7mUdZoZPCcOhflS7tFgfFzJ/j4JRGKgdGZvo7tC7rZyhEzlRD1TOWZuFxg/x4JQSKgKGcZytX3zFiCXUW1TbfYHxfkGndBAVVlqZlyGAsBJYPGm9fXHPlnb5odpvgJHp/5YJkz/hsyHgcDRSgxk7jMwpHMyz4TtbKzWExNV1OAdQhAMZ6oysRjTbEumaP12Pgq1GVPzruVzrEs7n1swmLW7C0IRneJS4jlV6EYhyJbAm999/ifM7LvUOwOm2pv9OAjsBXPF3UbBBaDz9ts4JHNUnWduXJZE6KmNUDLl9arpaBV7SdXmq98AArLFUCXTxMxhgci4gM1+9Ks5MASx2evoQlStSJRzIXixYYKFFVpd3fOTgNyNpM2Z+cFAwgJdUESGqeYb82V6bzDfXMUw1iXDpFwIhISFkfIduYwJpggJbbVOGNL90usUGei+3iZ7ngz5+VLa4sI+1z6yosJ4iFqf2huu1upTAjtSFGpWtjsWoGMNWKxubJz+PX/u2traUWDxhcR8apAmTY1SwoxBZkJiPvn65PNNsAYpTyYCpOfOSfb0PLYpNVuHY8qq3eey79/YSWSPxP4aoY0eBUytATouGDW+URU6AY3J4JsFkflcQ9jGdmx9ff1kt9mLH8MM862+WbM48eHhv2UYZpmfyw4ABsgwdLEwgTHtGyAYMEAwuFUY6C+XdQsyZzXSX61DivXi+6rVCGsQ/w3+Z/UKBogs+mf0xWg30sXanPsP+gUZRrdrlsraRc+Plto9yP1w5hU7gMWDACDd95+KOJ70UASa/H48UCph7JwIoIMLyUTz3Z1I8AgDCdV8QoijrjmIU+PnbB1IHSu4RPnNKF9mrBL9ToS3p9UwsQA/RuxqYZ7OWYOOCxzTKOED7pd6smhiRTRTId+HdaAdWwEW98IQcCFMjq2NAREOVp+PrhEozM9aKURYoQxgMF8nJpmbphPCW+DDnZTCabXvornC3DlWmGIR8jPtmyLdgIHIIyYQ3C4xxlqML9EubUkuxyZYvN+fN0lKmcBFhsEUWSV8XNDKjzVgce8KgFckZWBVm+uyFu3vQEQ1m91Z5svANqT/a+YRXm7O81bCI7F1qs55LGDK67AJ9u+chmerKJOaJCW5a1uRBFkhKl2ATRDEBWFs5dDLtdwbqjCPePSnTfIO0adqDzOl9OUrgN5o4Vs8aHvJj4dS2AaBDAXgsTkvzGd/PzKrZg/njsrkXFJFunJvF+LZtQFA24ap82Z+GqqyIdmuvXxoUhZo631uxU7ZMXQRbsnKqYwWdhxLoDtFuvXQJCA1IaXTp920AuBo6oaj4kwEJPNfbIoIxMNEJCaPf6HhIgFqEi7wSoW6EG5p23S8K4NlyMTbygSwdqkLQSV8tnUBB6TQhFwlKFfClqSg7xjbUBfCsSUDBhkZHWldZugApRFCYVeWOq89WlMH/x69M9lUvEX9OLoiPsKH5GumlJbOBAJphqCLNcimPwNCcaQcdWSBAYBh9KWUgxfzP0TWkLggsZVzHOGc1O6Pw3dnvae+VjeUchhRhpmf6kjpYvUnusuR1tG9VTH0JO8AkQa+y5jmokT8mabEWXUiA+oYY1IWayuJEMkFxKfRsJp4wdAxARtLiQRLdQeyKFpvZDONJMFAFcYMVIUQ8nRYMLxf+FeKZlQjaSLUwclBrsmBL0go8/nqNFW0941j9AZggArZHW3dRTY0HciaoSd/rM4hGfk6Chahf9hPpQtVBADFClL/K9OiM6KZaf7QSbyd43E2+WYRjGhC9wxcb2XGRPES58auSIRF6TKJsXIlyF2ZuALBDC1mxkMGoXQ9hbaKLMz+bXAgqGidgYMLNOOCsVGjYKReO5aYAXlSol0ha5JcyFjbijeTtGli7rxmZvo2iZ5tmC+SzX5YjCGAIjJxAU8ZBFVJv83vRZckhMDMHvtoyq1LqpGJVKVC/Hudu2CsGZKA9hFBq1FIQLrGiiiaq7VZha48CgzSemqAwsT+NHaCScrJHWaLKCaN8TiyEdkCkL+JBxSNZCJQSOhG0EChZbsS84PpyV2kvHgejkuP7p0hve9yzWIxRgRZCDRwgvdTSZgxfaByWzjrls39kBobjAh3A4/TSQb6XeH7A79IRCol9x8KoqQAnSpezu4dAbFyOOhKHrxe8WqNcZOHFVvA5fyCdACTXYSgZBHLgImFgZn5LHDUeXdw0mPoKDKYHZBuGeYSfkIWYSClq1JmeCQxPnyqK4owc4PxCStk4iYhsLarNwZdSEfkLzL0rCIZeJVEE2euZq0Xcg1sIxIP+/0rLnQeIhS6eIdkpmNCRAomixIzi4n3KCBZjhhhS0LkfSLEr0r3hbk3syomBClSCDK88JKbcfH5V+HIhVc7NTbOPoNHHvs0vvL4p/HIE5/ZVs/zqOL0N1sMuCAyIOOQzsxBB4UmkaLOwEEGNMcJQb/ID1BuwOuWDCI5IvA2hsNbSecrEKphoSANTJwr8cMDJqxNDAhTRJDcBD2SCGpz41JLCRQO7oFMN8Zyu3fuw5033Ic7b7gfu1f35wGu4gFOPf0V/MHHP4g/++vfLhen1q1ed/00V+pgbZQGkcWordq61kcrG4beo+aeq2nQc+oKcnaB3RpkmgQSzgqyhTx48IJOv4EYTh6vDPoIjYaxP/cxcwN2MiTtD80fvNPge71cZ3YSSDsYAtn3Rr+Vro5n7jx+H159y/di1879we/K1xxBQhVYf+Yr+PDHfx5/9qnfngl/q0VkhchHhN80C6gLgSIyetp/27nI9jW0LjAjlFEolr0+K4tyj403dNooTyPTRL1RAJjB1JU0TEranxgNScOaLiQuBEawhfv9hPpNINLMYSZkRrtZBKZMt9+7du7Dd7/2J3HsyM3sUabYuV9TBYYBaMU6fPjjv4A//PjPE5N51pPQ+SxT1Z6qqx0xp+cFbHBIYb8bTQvrgmHfG5eJPo/3N8cB9j1PPut/NKNosXt1z48Fk6eALKH3pOVkAUhQRAYMsiDLEePlAQq7YAwsNJIFJJHVXEB2KduZ5dWd+/CDb/4lHDn/qqKOESXNHWnCcT9eePGLIRCc/MonyX2FYLMI5DPFzVHFGUCX7oR8By94GFjpHj7hz1CqU7FNV734EAi5mLPqJLfJlNmnkN8fBa0SoPwNLDRzhDNX0QeqGDhqtHEu8njLy/8Z1vYdQTEQEQHFPMtEUKtFNf+98iXvwR03vDW3t45fCFk1DJM+5XyH0YyVx+1ulJOZcgJ6TnY7I+3z7yweU14O0hFyFcBaeWZ4ELuu+hGfmYPUyGz2hc5KxNwo59nKgIBBwiVZCE7c/G5cc9nLssLYdx1NPAC0Rs2m60loyJC/7qX/EEcuuDKXk/p8CUFVbnuxCDXcJqs3FAvrdOUcTVKuwpekuLlMtihg7gksVeJCliqdYzxSA10L3MSxgGQJr5YhEzCfFxIa/67Vaoy1r+0/gpde9/enDC3hLVsC/2vJPebf/e91t/9gbxO8f1K1USJ6YnpM+x50m+t75UIai5lVgokETH66XLMFQD00BMLv7nltfohrJZu0wpAq9ePpIYFLKdYgWQvNZbIGlfWGApx48fdg1859k8yHMZEjoxpUJXrxDG5yEceO3IQXX/ntEyblvlfwO58y92iIwHBWFMqNIMqwkE24XEL2zPWsAEaAgTso/YumG7OkJTkhE5xnCcV3ngbiawStSxNzl93DdFwhtCLw9Vj/wX0X4abL786tZEtAHdfyWemCSl8Sntfd/oNY3bk/+Wu2eNngiruDwDJCCtbPuEazkOTvbrqFaFNDdrK+HOZIohkJisZszNTZYI7xJGYCs4eegseoS+Lm3FiaGaTpPpqdm6yCtWsqEKx997/yXzijzKT7DGkUzhbB0GLqE27g2xRY3bkPJ25+V/SxuKnUDxZqyUIgiRYVJxR6OomHLJwJO537UHYhzpuU+D5XJXPpGJOi9Cs1vmpDTplKIGNkVJ3zD7FIw0ymm9RO8Buv+HZcdPAKb1xa7jW33I58fPqr3Z1zHQrcft2bcXD/ETeXan3UcXiYTXciehECpklYSMM79sQsGCFsmWVCz8jciJBz6jXGCWblUsnHK/KTSqcs4zdn/qtQhVWo4lHMqWUk2T8Kmc0yXvDyGx+YPGdi3ktoZ9WohnbP5EqiDp6GB8Eb7/qRcRxYor2B/jPzqiBUsBfp7nOUSfV1lbZUcaFw0IjOzKzvQB/CSz0V1J5nf7X9wY1EFiQJ6ebcPruSLFTj76FrQnYskhjx8he9C2t7DyfGpk8trgBxTot7cAFBsQr1nAJHj9yIay596diLgdxZcXkhADQjukYOLDSzyhEMDWDMtB+IW1M+yaR8XBkM4ce5EgFQzJp9U5wfZPrAqC4zLFsQY2iVfGYgEdG0rLfpwL7DePmL3hn59u77zQI4GfvkikZaLJj6fqujCkR1ESYM337b+7C6a2/0qYZ9PC/ArkhobmXuBEtMLGkokLoDZ2hMh4c5fWCI+k0OckwEhfQWBk58USIBPQCJAKnRihy+VEbzIhF2I3VhZy/FmvbyF71z0iTuu5n2kWFmOjNOqPhAZCoMFQja/Qf2Hcbt1715xtTDBZbpkfBOMvuF+aQQE3qyrdRSbIZT1ikt99sx1EVFKGGTzTWo2p+NxozfK4kKxXQu/UQIRAJEpRqzSRQAB/YexouOvSaZczf3LYO8JLrMUNd0jfsbksZ447XggH7utmvuxdq+w4mG3l7GMoLkFqpfT89yixB9jt+A1vLpueSCNFyKyRtvTaEa67hI8gVF6VDp4UwlgDgDtKdupCJUmTLbCYe5FHEc73r1T8X8trQtSq4HlP7Vcj4ERIL5qeNTItfzu3fuxRvu+EfFZBsdMyNBTIz+M+NAIWOlS/weJNPQEvlZsM29ln6XeiMVrMCE86bdrO3cpLTGD4lZ1OWkwfEpTnwLgXJIyC6F6hLBi469BuftPhwpXKQ5Fk4E47GQZUgHg0VJLfM8wiRXgBAcxShclx2+AZcdPj5hllKNrmBs3reLsIqlnBOquSRutRTcghznwcsNSCyrpeoql7kja0uNBVL4NtGT8tTZn1modq3sxcuOvz18IDJjWShy6GYFSohY66h5gwoEq0b166+/4/1Y3bk3A+BqEYaKs6bhXY24JhhoJq9RrUVVm3qNnzGkIiyR9H3KrNDOuRBxjnFz8apsQ4hsHukUgNuufiMO7Dkcml99df1eBnoYK8Q+PFQWRUDKMTeuAABrew/jtmvfWHw9d6B/arWI+ftYnECiuWWmMatwb/isEMx413p6qFfyPVpuIU44XqBz5ocmQWckf+Y6nzWFH03TmXUEfndd93Y32XPj+rPazWW01M+aXUHjTBg4UZgW5Ljlqjdgbe/hAH+z5py4I+w658KReeBneGo7TU8Wqgpgcgw2IcQuz+0qUoSuHsXdTHIK/jMpW5Xkc1VsCiW46/q3JZ8scxHLnBB8g7+Jfwe5EZ0+I90vYWFWd+7Fq1/yfd3fs/IU5hORVSdOcwYAFlp4O4OOcz4+PWs+E1RcAFsADiVmWxKPmjc3Yc7drG0LCCdNpxBmpOWhA8dw/LJXJY2vmT8wKNwOwW93DiQMM+4lpZK5mjJ4dOUl34ZLDx3fVmXq6iJCCG4VtFyJT3IJRog5a1sUTdl+pEyjjhYghwnc4ypOkrVaQhGSpOt2QlGtsvijcgemIeKb7/inScsnZn6GqbMp4dKY2UGhb2Q9fD6n5rr7fa+++fsIC+S+aeXZjEAEb7N4RHkNGinfVaxItcrOnrBOA/M3Y5/tzZA/tKaRqRGsFVwf2YSptfGG5vHs40dfhQO7D/uzq2ZO/PeMXwem1zAZIJnpp9Z+0DWR/KwuEIfWjuGWq14/OwwZ+Zka8mU6jaavOoece5ku5VP/Nq2VlTPuG1CEKrVjgnim1c5u2zrnDjpyU5Ifv1o1guo8sOcw7rr2fm+CC5YBsIJb2jZWYjIaODM6yMzm+QTp2pyl8KYHnL3r+P1Y3blvRjvZAM8TLrsAviYECjOt48nKxWdyKZnVA2sqpwyT1vA3Pj8Z7Kg9mxnNAl9DMWN8efx9/LJX4rzdh7ZNyijy5pgCW1UTZVObNP+0H3UrvnR5O0swg0Xsb9eOvbjr+P3Ee0m31X7alYnwbqN6A6okeIXZKtOomEVPjA1tdkIZBakPr8zJLdvejM7LuGnK1E0YR8dmHdhzGHdec18FDsFLzZ1hkGbbBXBTGdlv95egz0z/JmHjnGvpx0uuvAcvOHR8WzPPNiGyoIXG28QEWhsn9TrhC+sTlbXvQ/ghMgxKBWuzZ60DlxH6rD5Mp922uQIzruSl17x1ap4173bSWiF8Me/pPsnmf9KqKgjncB1OCksZN8o9txC2O6+7r1KQJruYFFO2lPthSjnjDWresArZwPxiHhTLOOQ7iUFdeurVuMZ3BtPV17nPGY4yDs6V8E0KXHnk23D80ldOiiVCVdrMIH0P2zi8q3XMhXa0YC5X2D9adS815T1ef8Gh63Hr1ffMqkPuN/KQ+YzrSP1ECScETmHvGmMazOoYJYK84PZ3jFpSRphQRW2ObHkEIAmOUYoNoQAnjr97LFs1b5uZP6mzc+advdzMEPHEom5XV+7AOcFm3/sRd1x7H3bt2DsRPKeLqisP++loE2uUpOcyup+YAWIF40Fm61Daz64nbXKIaHMW0CAjPXOSU55pV3ZIbtBEcP2lJ3De7kOZKUUjk/+vS75Kq6oJRz3Hv9tMFnC7bGE1jzMaBoyA8M7r70vcEErl0v5hsSMo0Wq+4jkrLK7CLg+kz/5sqiW2d9zupU3O9f5JlAiWI4lDrISdqWrSOeqSCA7svhB3XH3fNP16Dk1XjaVeiWGYCg2XYX8/YeA2Pp+fbRhgu45yvbdcdQ8Orx2b7bnptA/pbJtI6xSfTdAGVZNyVk1NgFDCAkz9A7+LBv7gsCU2EJQ9X1gA9m18lWU1HwLBi194D/bvvjAaO6N1pql23ptUK2RzTH6Z5VO5LVUouG3VvJf6J9GBpmZAFXjlTe8JzXUXEKAud8FMLZv9jst6oToXE2m+Dz88y4DTwVLBLG3JT6X685501lOhBqH7MNuk2BuM6cRQNXOnfYtXEZy3eiFuPvadE0KaNidNLGacwd6Eid1CVJOt/Dnj6pP1KUqSwkUi6sRy0d+lF1yP45ed8DtskCsyepKYlfAFOWJTpFaltFo7mfK1zvGcTCtJeWPN5iQIoySd4T4sAphz/54lo09vQb//pVffN+9LdY471L8i5dW3Ayz1M75Ip9+1lqe3zXjdljzaDh8o4vUu/fyd192H1R17PSTVFruDJboAboFtx/Hgnf2uQ8LF6s7QMgRBjfyMErIJSbtxkeTFkqa8K0eYqB7b6mimBjcxZcCBhOXyQ7fimotf4ZqapmRVk1oneHBnqawoMedcJtq+tyCjcB1263bZwtIWSfUzQ4Hzdh/CS668x+kVeykxg2lKuVZTL8Qyo3+AyAT78+OT+ws3Qr1QtgAqZP7IU5JUZ9/CFLEkz2imJobKB1GiyS+79t2JQaYdycSXWblOcMKm1Ux72TmasOUopp7dQxKYmewjQPrX09BsGep8xTuuuR8H9h6qVAlGlgEbnQy6jTwYhJFDqOSkj0T2SRTAgmr72tqdIrFPB5POfwnN2ElxfFm5qo4EqCGRFLr24ldi/65DHc2rh2L+R8xt9GnEaTNzALRNCTHnoyeCw58c9FTB0mJhChtl5jvX8bpbfmjCDLeyLtHwWUNsibENAMz4ILGsPt6PmBSqQnvVxezTxjtv10PzExhl+5/nE8x9IL1+bv/qhbj18rf2lTvjDc01X7I7aIAuY4VPEpDWN0ry1+7GVO/UexagGcYmZrdi5YoLSch/RlgnWIRS0ZeefxwvuPCGQGUMtLYBd1K+QfNEsWSDZ9jlNGEBiOcqBsKEqoHyR8aacORW1fazSxBPGCmE/gP18dYXvhX7dl04o/HEUBeCkYrarcRoLRS6NMKGwDiWwDxjJqCwCIQJTgVTifkzHOLzgvwcpfmDqsDdN//QCAjJfto0/GRrqc6hnFZklhD5CReEg6hlY0aQbbjIDrHmqaszhaFYoUeQU2yJDNkEdUB09UWvTHn11h1oCIQ6o1sD2lJJU6VbCfWygRs0WQ9jnhYGV8yQGLbNJ/chRQQzFqLiBxamA3sP4ebL31DUh7Z39dcKhZ+3JJvmZrgIqWcUC1ahz4QBmMH+pilFf1VbMfASbfHNpWgCR1oJ02hDEO9c3rXq1mNvTcQ1rU2RAOaJ6gxP+ECS23ALYYLjQlIEpJcFwjWEQBLzy98kQimfc4KjfL0Bt1zxBpy358IkV24NJvTTXEGyvh0b2KQb1tWi9szX/AirX4Cm4+aEkWwgyevXp4ZfCeBNDw+xRHD1kRO48tAJ19pWtbf1AHOp2aQzczUYCpWwAE2pXAgKkpuQshFU/T1j7isQ5O/FOjSNP5Us1HzsWNmL173k/QloKz+sW2RnmC+zJ5dRYjGnMyLsZgDeyBqvRNinwbjix2rFUGAY+mZISicN6fgm+rTZg3uU8dxLLru/PzKmlfHyBs8e9usy2fMuHhftzwpivlS7lbLnxNZ4pi2x724CNVZ/o/NUt1JySAZgawlsNfJ8SNsiQSTe1bugeQ2XXnADLr3gOL742CfDbKepcUJv/dB8yZxrfWlKp4lyGY1Q3zaXHlLiJ7iU5rdJojPvsdb8Pp9aJLZZwdiVgenZpfGGS+7Bvp0XetjXCPjFb3VLwOBO22iVkp/XMd/Q2DKYBSArYRpuZVq3PKC6kqZqTO5oLUJQF4RebtmAZ88Ap58Dzm4Byy2gbQFtGZ+6HD+32igoZxtwFhh3/VXg7pvfnyMtfw5pP48XlNhSMI/8HXv5+E3iNoWBtsvFXFBL3+v+fONyt5x+qMg/7gX27z6E6y++x+N9MxyNQB8zKUUEZK5bU2eumXY38WWqd44CJLAEY40GB5QhIAE6R2HI51tTPHcWePpZYHOzM9sY35m/ZEGg68v+d3YJbCiwZ/dh3HHNOyBpAzzaQ7kym05JNkwTMDIa6DY7YOaK64R0waOOR3MoRKn2hh7IUYFG3hoAbr70fuzbeXgUESXfb3G8SghD8uOB9pv7dEma3LwO7f5XqaxZmDZlvguEFisRW7GP7ZMQUgie2xCcPt21e6u3c0kCsKRr/fdyKwuDXd9cAtcffRN2rewNJqvOkFnd4yZl9rLkF9NI4kBioV7PIDSqVKdy+WhVP2nM1EaDEx5XB5ttm3IZc5ouMPt3HcIVF77StZ8ZbSGdAU0jtml5M+ZrRv4cak20vLgWe0ar0UMRgsaWg59JwnfmDHD62aL1m1nbWRiWW+cQjF5+Rfbizuu+32kvM3mWUDSyBryIxFw4h+4gRtErrrW/r2SK2Gv2qx/DQCtbCBPFNjMmVf3RnvgYpfJllz/oSZvWtK+wEQ/LWooGjGmmecHEYI4SkxD5ANJ8FrBGEzftGe7/E3aYjkFYeAkFlkvBs09nU8/arMUSqP0VoWgt7lv2e6+6+LW4+Hk3Jr6xgrNBcFzFQmGYwUYRJZe3kq3zaiVQYQ4VOLBQS0E0Yr6CtLsEL577D7xwxQWvwuF914cw+hM7E/Ki4163RQh5AqT2h3gU0d/LKzKM79UidO6P6Il7ZW2x/fSDYmMkxGCvU1lJwZ58ggID2tjDy5RddGkXWKS9MMlK22drwC3H3oW/feLPZqMx1snEYO0AnDJc0l8ZJ6LutugtigHSw5zX8Xwed55BEBb3kwsRmhUs9P6emy5+ewCollO8LhRszieIngeJulVwrRb37xn4qZt0j/0JM2T3QZaGowwjXFfBZ58CtjbnzTxrdfq9LBai3lsA4uEDN+KGS78ra++MBEwmeWq01ecWWvhbUsyGk/ydQTJEEK1q+/PxfjUUK3s1BTRMxGP0MTde/A7s3XGo++ZIcFhDTaMtTLH2JutG0cZ4Pe5VGYdGfQJFAqMjmFLXctLGHuL7gAgN/nMdVu9yCZx5hobJZXwLLGuwt/scWj53Xsv3my97AJ965HfwnD7tuAiSt433VJxEJpNJFtbOBFnjTcadlYMxyhIpNYUb75kJouXt2zjBE8wVGTd63LfrMC4//zWhUZQPiOxd1ljb0292hI32BGrLCAE5tid32HMEof2RW4hFJZ61a3Yu3pPMWcUzTwNbZ2d8/lb+ZJCnDPqWBTSJ5unEAAAcZklEQVTyuWWuZ0X24ebL3p1przE8GQDRXB6Bv26VxbhrW9jWBSXiFqDP3jE+tqicc3OuPN13Jj+LNr4buKuA9vtfdPgd2LMyjvaxoTCPxJoXCzQKNrBMnmn1TMaLJVTdrYcW2yvl0ryumeweLCrqobEMAcTOPC0jmDMNbsX3Fytg79UOTFMsAfp7M7s6Syl33UXfhS889jF85cn/XdKehLVEipIS8GFqUhG2rCsM/1QVMtTNjIO2vsdRB0oubdCSvhiZu2/nEbzw4Gs7go1Xq0t/V6K/6W5AMBsseF1Tk0/rgkM+znmX1hfExk8qNsIWQFa7gAg12j2AwN8DbBjgzDOCzecysFNiugmA9Ey4DLSErQoFC0eL+3RGUF586XtGAWDWqdHIZh9pvu6hQ3Baipxb21fSC4/B6FFp1slIhKaKhYyv1hJznEqQ2xrWO/H3jv5ol7y8ikNbXw1j4ePSrodvCh9st6lLuxqzJhaFIgTHAGZJpLw3FwkVW/NHLKTUtbHkqSefwOef+jAeP/tJbCwfx76V52PfygtwbP/rsXvlAm+ru9dWhKO/SccFkLCDFlygJDCH9r4YV1z4HfjM134rMRP0TmIJdOR0FK9M+6t0m0dHrY99NG1YYRwXX8k0JgtA6Mk1x3SW1wQqXnjwtVjbeTlai7gULE8sc5WTScODGEqvfdfERgFID+yckuC5xmkIBLRNVzG1rE0K4G+e+GN84pH/jK32rIPiZ7a+jGc2v4THNz6BK/bfjyOrd0A5/JPtBaJaEfbpPEPcLOWtz38QX/z6R/Hc1pNOaxfS+iLs+IcMAu8OalP5xyRNmlpmmuZEZcK4mY1UpHOIZqQO3fXecOG7Ypi2Jm40AJsBMgNbTeHhGIeEOdvX08VLCtfOmcTJcwNUY5An2pafZX+nz34df/6l38CynRmp0hNRQ8/aL/UMPvfsr+Gps1+aJH5mQaD9piSQVjDY8v0r2IdrL7wvWQmXE/rBFgd9rgYvxgEp9zBYDwgdjJMQBq+AOT9I9rciucz4TsHx3A2HHsCelYtSho2ZzIM1SgM/Bse1CIGnYUmQzGSnuQI8D8CEorfY66RJIxwpeI4iCaviv3/qIWy2jciFOJIO7djcOo3PPvNrKatnqd8lDf5wdJDO19HDGhUsgRcdei/27jjSlY8QfyekWAaQALG9XNKH0olnNuUvbxPHJtKFIMxNNr9sFnpjVLF350W48uBbnOCmVa0nb0DErppa1wR4eOcTPnWaHNKsxZ7csZCOE0+TemgSySQlLPjUV38XZzZPhT/tFoAznNLfa/DU1qdwduv0ZPi3zYWBnD4ug0j+yaFiH2O445If7f5MiTdmrYu5Jm0fs7JKZ8NtrBj3xH1sBn4WakyqVx0He1T7LJWxMccveDd2yH6flj2+3TpA1YjIJaUNzFyFANPkDsOGjEcsqqCsUeADCSRetwdmGGxhntcZbWiqOHX6c/j0o787mnyh51kAq41oMn7bbE9jIaukoeLWs3HsXqIGLAkkUvsYF0gDLlx9CZ6//wS+9PSH45WxvDhHM9r39RsSS85iTuHYnxU3Gz1xE8QYUiMZbFhFohENqAJ7d16Ey/bf7cxHVJeJ13P33qqZ8C4JnAZhrC1Be3HgZvn5ECKaIuRIVCPEIzlngm1sncKff/k/+uIWNRDZejBrPlCpPwAG7EDDJqSjQZUBooKlhvvI/eh5AJnmASZhZr/n5gt+BF999k/x3PJJAsGIDSM8giEa0f4DdoOB5JVREobYnKCET5kbXeokXn2k3RKIACee/9MR8wd0Zw5TtrDjeO+l/Z5GABTkUdYldzLndMozYeFQJLaUw1DNgvfZr/0+NjZPpTengcVXkQgqAHbK8zBgBxRbvYsDrX/oAuCvj6Pp30xmHiiaEwgBdg8X46oD78D/+frPuOC1LohCr54PGiEJRlBopI3PCfRdp2gwIaV4yTW4PFAi5ej+12H3cJGLuGth546mrCLxSLKCan/erv2Ciy8XXHSFYHUf8OjngEc/17D+aBkoEJIrFjBnXKQG3RmR23CB7+195KmP45EnP941JPqoCiwG6VamJ5QonLpox6vRsAm0eMexRw2IF0VqFwrV0Wag0XsFGs28ps+hjxLa76v2fzc+/9TDeHbrSwj+NnoD+cz6NaOB0NRy1Y4BPM3KrxFMqbnCtcjeQRQ7hv247uD3AhqDEnl+W93OgzSL7LD58TvessCJBwas7qvIY4FP/n7DR35lifWvUpPMSpSkFoe14fdYPsLyAIqNrVP4/ON/ENeFJo2KbeVCI5idI3uHy7C2uAFNtzLTbVBcBKr8xvGBdg3vQgEZ3+Hlv+HuZlkyhQvZj9vO/5f4yFfflfjME2zdMggPecc4iZVfQTqKRhD4C9PcidbQQSBw5YG3YvdwEWwAxc0t+3O33lL53mVkZM6b/skCN989fRmCHTe9dsDRGwW/+MNbOPVoF14BgUgzh5GrZjEK3GlCH0Lyma/9Fja2TjnwVcpvBKZQnxjTVLFTDuD5O1+PplsRGRC3pOOAEQMMXWdikEB6GXUXEYLj00AbvbizV33+yq24cNdt+NrGn0TfHARqnisgiJHYontDYjofAp86zFx0ENaJu3fHEVx74L1u9tuy5bjfZujUyZa8lq+XOfE952a+HWuHBff+45WcYyjPUxsBbDHKV9cNWIiqCnx5/Y/w2LN/5QxU0lfy4q4cXdxwweIODNiLhk0sdRNNN7Fsm2i6BcXW+Fs3sezfm26N17HZf8efzpxrzc5voekSTZuHxrcc+AnsGPa7G0pRSdfVFr6RFvEEjPZ3BjGgiq/WzUCP6WGquPbAe1NczskVm97Nc//askXWjwRh7bDgVd+zwDd7HLtRcPTGMj3MJ3hIapMlPca4X2ga2vh35uwpfPaJ/5L2HxREHZGLZiIrDiyuw/7FtVDdGhlun9hCc4ZvQjUzXLHpwsHlmp3vf4rpfSEcW1gdDuOKPe90pjEolc6IYQjeBo8Dzw3OMRcO9ZstznQj2rLJXNt5FV6w557OWE7lqmOBxJi+YiIlbhqwa6/gvT+9Y8Lkj370o3jooYdw8uTJWSG44y2LmO2TkkpaPkMYJ3MOFPiLRz+YoIkLAeOFHg/b0OuK7MfB4SXOuPSnpvnBzNa2RguB8fyynXXmL7XeR8w2y1IFqgvBFfvejr0rl1AbEb5VIrILvkvq2wBP/8q005XidlP/vP38fz0SeGkgThJjfTKlEZxX+1rGURWvfs8CB4/kp73//e/HiRMn8OCDD+LYsWN4+OGHJwJw0RWjZjbNWUBnelpLYEJgtnEU5L9Z/zA2NtdjqJo3Y/AdQ8StiGGCg8O3YcBuYgpbgTkTf7Zr/VYXFGJoP78k5i+buZTRophAVAsxYBU37P9hsOl1I98Qblsp3vSpboYBTPMjtxHpX5hEEQGa4gV7Xo/dw5E02BLz8sUjglhfQGa3z+NrClz/9xa4663Z9J88eRIf+MAH0rmHHnpoIgAADfIkDACaKwgXEsMltqjkmee+gi+t/2Hk0Y31lm31GTIg5RDsH67GqlzSTfbIlKWeRdOzbgW0M8sEw7Q7NNiEYcuxg/2NGKFgCLcGZycCdtHqy3DBrltopWfvz0AAOOVy4Mv6PBWs7N9UIUNmCqcC9qxcjGv2fT/F+hFHRzo15x9UIgFhGvW8iwe84cESiABYX1//ps5tPE3j694UC1+N+RTzU1SypRv49OP/wcMtkxSfQwdK0tDyrAX2YJ9cj6abjvJH1zgi+QgBY1GgvQ19NifgaB/jp224pRFNiAy9n/GSbuEkkw44vv/9+Mhjb6fkUH2HHrkEw3JmATx88ISMxKqY+k42KF6w+41d+5VG1uriCS0DPnWxhuA13zc1/QBw00034RWveEU69+CDD07KPfIZWs9HK3fSSiFf+h0DP60p/nb9I3jOQ75SsQkOZ5B73HRwuAsKGVF9BXL8CdJiMt+u1YTu8ydZAo1n6MRlhBVZ6ib2LY7hhXvvo8xG9uUcEsKSfDEn0NK7XT+X4wTBUZnopYcC7FlcjKv3vq9kFnssDunTnMrgDkmXZddue/0Ct96zPer/0Ic+hIcffhgf+9jH8MADD0wEAgB+/4NbozvxFcTUSZv94poccfHjpz+BR5/9n15WaRDFM9U8y6b3cc9wBaA7x4wfBIMMo6Xr6d3B90SM4NEDSI1ET9biIRJBPVWsNPKoajOzKcPYJsEpBIIr970bXzz9W2jtqWki0IW7xa4ACsgFBy/QWIAotPMUAAx9gGhswDAIbt7/E7h09d6sNTRxMwmeBCdMMkUEzzsi+IGf24nnXTzV/m/2+G8fXOL3fm4zJ5uI+ZzwYP93tj2JT3/9F3G2nfJzMK0xIe3j6Er/DtiFA3JXyu27SWZz7NN8Rtr58hjhcpwVJEZKuILKXH+zqnbQrubH+dmC//vUv8EXTv96l9slgL6nkoWDnC4eh4MttOE0qoURqMYE5++4FUDkpqXPb1OeYGm1aAwKRS5B8bYf/9aYf+oRxe/9u82wKGSBwjSN5Gs8dgHBI898JDNfY9UQkMMmEx4FsIrL+khf5GWFNFr6yhzpM0IF4yhgMHJkVuy7QoKBYG5ifM8iqoRVERk67Qe3BG5VVPC8nS/CydO/PvbJZHqI5J2FsdbPFWOxj02bG3Czbao03rSKS2JuftDQsVcFgzEmPVqEu//BCq645Rtn+851/Mz3b46mV5lLmsw8XIxjKsRjZ/4Xvn7mE2NzeOwdZDVU2XgSOFxF082Uy4enbDsjbSBIxbXTr3UGti4oocHII4SeNpY+rBzgcXQ5koRFOwi0uYorWKVBoe4x+vR2nj4uPUu4wsTSplikt1ny1fHc2fYUdg7n9TF9uLBoKiYEKK0KxfMuEdz9vinq/7scD/+rTTzx5aVbKLCAEeYwv2+hyNm2jkdP/2FovbeVGJ46EYNEo8a00QJIjOAxqrf8gp3zoV/Jg0OG2hPDzZQD/nvcts/S0tItyuDjBCYk5p5HSzHgLJ5CN33O6NB8xjboAgMqyGY/4oXI/Kjiyc2/wgU7biPtidAiTtmsHKXxfsEP/eKub4n5n/14w8d+dRnZCY02jASINtgiUXNNn33y57HUjcDInPkUZjYd2nw4eInTWGAlAzYO73R8ObQN845KURkZDASkD/8O/TOmmylhhYnwpKHmDD4Fgq+e+SM33DwoNILTRlZ67G9EAQ1F83lsoIM4UXxm42fxvJXbnAGCGIaMYXpeuTsW/M4f/Nb8/tcfUfzqP9/0kM5iNPPJPsvIFnP0vgiAL53+DZxdnorK0qwhIhT120WiD6lu4TFA9/Q1iDymTz64zcT8ZiEaPM6384oo65ptgFwJXzAI7P4/yvcZRzJgY+sxfOW5D/fWm2+2t6h1RS7086VhGGzCJs8LJHnoJvbxrT/Fyed+BZfteGcnfF+zRiuBSXIAAc6/ZMB3/MC3Zvr/67/dwhOPpNizE8bm9pUtbhRo2MAXz/x7PLv5eTelnhQpoAhONi1CMPqLLTwOwXnQtn9i1hNDjJndvA8yoLXQ3KFaDzbpZj3svGMFcYEwCxEuJADkXzz1U53kfRMoIYxmipH65SDQXJ34gsKKAdzVCvCXZ34Km+0ZXL7zfYmwsVFEv0uAPfsED/7Kt2b6/+Q3l/jjD23lk93hmyvSNKlzA49v/g88fvaP0PS5sS3u0sApvtRHxhTqCzFNKBrO4vNYkSNY6Pljn22rNsr+mVYaTlgSNhh/B/Bjc6/mDjrqdyyBoViIEBIThLPtCXzm2V/A08svdvY2YjQSIETJl8j5By9Q0yShV4jkAaLB/fowLLzTu4dLcHjlVdi/uMbRtk0sNYm/+rYFXvqWHf15ESdH/M5hkc007KPU/Zm/87Nb+PojPEklzFJYK0HTM3iufQVPLv8SrW1EWVeBIkDGeMoDjJGEbSnXuk1oHUsomi4xYC8GnIc8n4ajpwmaIKtlv6Z5E1Y8hmBcxOgsEGzpaTy19Wk8ufkpbOqzSXDDmvXMrAPi2JBBLREUiGiw9zckwOFo1laUeOhi/mjwT9cKDBiw8AyWYMAgiy4Ai3EnUrvXyy38u4U9XAb+HInQCYNr3gDSDs+vi4uZ28TCtvjGLmZJiaBGySEm8LITctlxxLJHCyEsozFuUCz7XxcqHRctNKVzbdnLNq8PLoyK1ra6UGQmN22u8zyMzzhmsuFnD+tXsrgaQpZ0zk2mCLRngEKBupnsOIDn75uvEUV0RBUiPT3TWt+ernWTFuHdyNTY8cNGtkZTv6BQZiRwJLKBgHOhL6x/WQxaauv4vdlL3GhWlDpYHDvUPDy0T9Xm9TQXFGNwIyGL0FLERlGX+R245ooabXohMQm1BzAxO8t9NCWz2pggc/fHrqAreloZxDzNEKDl13VSZk+72THmmsRFIrWFPPZ6TNrRQ0WgoXVtsnez83wBKwPY1m2xwWCMejVimM6eGz9Nw0wjC1N6WX4mEDNux5Axfita31a3xXYs/uylt2CO+ZC+bR31zdtuQmZYpz/D6Uu0Tgrs2EZjvpcAVCh9X5HM6RgpSodwiTxX37OFgaptDKChYYGFi4rIaBYX7ueWXS77FsfdkoyEXunbtwwjIW2/QR+AMTc0+FprX99gz/OtkyUJ7PTIVqCZKRUjuDEiBHVsZ4MaA13o7XuY+iR42jz13FoIMlxE1C2GcpRCZUJRly5S3H5X4s46bbXn4uPoK0pTvjh92zFYN80x2zTF/L7rRm9jW0Jk4USzXbvE/A7sXOtYwKS856c03IsjWUXf/cpcUWzkbwbdDZwnM8wlLAMDhORmk+jCHObfFrso+VOYlZNudYSZa+xma9TcPYhbFHVBqlahWopY2t6xRWmP95VcRnZt5xL4oMVKFB6IMJFA4I2chJacROKHxs19YIlGAglK2fp8lYZBxYkzEsSwAAAsfJWLDef2tVlQlZ6ykO77bTKGTbku/ssmWJhEmwLQ2r5K8BGcITF/3PSyobUOzFqL+8i9GCgEuaI2ZwXSd6YTT2JVdzVpjILNP0KgMi7bjvOIvgIcx3TGDfneWCOgnnGz8zyKyGbeyo/ts1nEi94uswbmEpq/VWwcZFFKYoib4cAvNs7Qky10TT2pgr7i0sbhS8ipZCw5EaQhCJ4HMOZqK5qfLYBvwk5gUIVyCR31J3zkOCJAo2MasWlVmvvoed7GqpWdg4eiZVKo2UoyHCsKXQdkzX2lLYCE+gbSTucW55oqBt/CnMbclASloe+PboDK9qttVHQIP9eBjyuijMGk+2Cg16EYdAnRwZVafRIfLaMJ3zBuFGVRQnKHhLy7O6haCRTm94UvYbiXvi2q5QwcyLorIDDMGIKYyAB2jLZCQL09NDU/rY3kxZ8FK+TDFBhQ1fUVKE5CcBNRJAoQwUZfnxeQcv5cVYiYaniySyqBPIgvK3fTNtBcMSz6AMy4wGSpHcyVPI56uMjM71quQyeAuNlX+2RPyegZMaPWNJUFwIGeATz/bDaVuAvHstfYEmMT8+mVDelaiyjJ6yNYC0L4Ma7Pikd6Ln0TzSTx4fT6cXJFgD+H4iYHFALP6xvczluWx/OcARrxt4CWJWn3tYN0ENPNPW12KJZbAEYmDtExsUke3VVIB3gj2SxFuhzTroOWySnSAWJsuyW8rt8XSZpEW4Kk+a4bYf7DnDfTeNJYdwVaccGShMQUZVmSSRn1w3GXZubbCKfFGo61sk9PeEaKtSNb0i98crFvdd8aBPcawuejy4IPukjPDnoaN6VzQ77y2kIJq1JSt+VJXWezcPB3l1EyBwp7DsLqeAe145IZSqR8AYVwCH+dzXbrQhjA0K9TLsLrEsMyMTu3EWYIRvHCBXODZPITw7JQZJOPcDs2vF38XQD2LjxoD8na2tragOELIrJW2DgmVj3si3TweAyOwP1zZgaMSLxaRoaFD4JwijjOLXoKuKd9/UV2Qw8vxdPOPnJG4+ODLcQcYvVtDKAUH5JIV0cGc9LKog02+aqs8c0BrfZQtaEFdiAt3xYLtFFYOJlkYDgn1iytS+CVtR7oEUoISB6qD4DY0A4uNjY2Nnav7j4ikNtNy9MxmF/NW4rx7lSUSUiDFbwYMW+2QEImkn7zIT4wEdGGuRy/3kV9nIxB/jAwb3j9/taMAGfqoS0ztvW4uzmDEExikGa+XAgTkPZqYb79bt2Yu4DQFC7XYGE99xZMhq+puyQ4BQTGtKAYsAJ+6dT6qf+0AIBdq7v+WkQeZPaxgkgyzTlTaNAKZN6JZd06ZJcR3ONHZfsTz6dM48wlRsrU5GRKx7i6Rd7CtNbZ0YqGWhhLANBNemwybG6jTXz60pmagKIzn9yIaooS7LmeOKI+RdtnRhGlb4qdWT+ho23D09DetLGxsb4AgI2NjfU9q3sOArg9D7fSQdaBfXwIhaQHwffOIathgCxhDUkf0V3a10oCxcetvHs5LUNKsmuapIVBZE7RoBLxuROexhzC52tirA1EAZEdbB7e9ZyAmGDF69oUoxDpoJ46tni/WS6lYACzGZTtSSTkQaJMyRgrcFwg8tCpU6d+DYi3mGHX6q4/FpH7RWWNN3RKzzQAaNO9EiDzHevoleSSmuJuogGysPBMHSya7Oa5/iGQSlV6roKFxpBgj9PrEfGz5f4rU02YImsHJ39J6ZouK/v0DB4xEazmgzVZm/vC2QTwgmm+0weN5VOnvA+zMEcnZvVk0/a2jY2NjSQAGxsbG7tWd/2miNwLYM2YzKwseD5NJHXeyBiRKyFyrW5AxDdhtlYLTSkLzZ7O44gG6UznAtBVpioxGonMeaSQ/9h0s5aPEQEJgQtJI7cRkYALCmUDfdCIZiUz8g8x2Z75VqpxZrNQo5w52dBOrK+vP2pn0tqsjY2N9V2ruz42yHA3gLXpriExDSli66kQGMOz/uem+Z47EbfFRBQU0O7fq2sKf+d406wA4xMfdFLPU4wCREPQEky0MuH7NdyJZwlLDl87irffQkkjC+840rDJqKUe2JRFQ/t12rp40nEcDkfFA9tRXE82tDetr6//dWLp3K1ra2tHBwwfEZGjUzzQgziRLABQn7k6tnMoy8zE743/LHU7eDiZZ/3kcBEaYZ/6bCCbi9fnAknMBPK2KcjNeEgQ4xk2iyWNQ/AIHYjhILCoPleikVtJLkHJepTxBcb39gwT62bWIQFcyu3T9VaYDa/NXr4M0/zJThuzqzO7JfjlAcNuEbl9IgC+/i0DujRPwE9SWji6kdxJLh+VaYiWG0QHklScwaZ2jWiqdB+/NMo0kDRU6FNsilUwOyIFTYzniSaGEVirVZu/qgWpPvVv0ZX+rubeVhdE8u+wn0YL2v6FD8dS41qFh5q2t7HZz9z8Bsfa2trRxbD4MVF5IN8YiaGM9O3foe8iOmrWYPPaE+spKWTnTdtF+mQQu0oTRvkeG/iRbGHSdBADri6e4mvnjFwsaIlRPscgwJ+6IC2NdcHU1vJcglmtJ8BJGEU7KB5TwnmySLSsl1Ykq8RHg66L4peXWH5gTuv/TgJAgrC2AzvubUN7hajcCMhRQNaGwYgbiC/AYTB8YdlBXtlSPgdzCXZehlgQ4ZnJssQ6CQ/S/RxBTLsqRHy49o4/AlkrbbESSN/MumXYeJi3ed4h2MUJIMb34WJaszBO2cmPJV1CNc0DDGCIdShOKvSTwPCxJTYfXp/bUWPm+H/y2lTCTYcsBQAAAABJRU5ErkJggg==';

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