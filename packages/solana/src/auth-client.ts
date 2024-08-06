import {
  W3mFrameConstants,
  W3mFrameHelpers,
  W3mFrameProvider,
  W3mFrameRpcConstants,
  type W3mFrameTypes
} from '@web3modal/wallet'
import { type CombinedProvider } from './utils/scaffold'
import type { ISolanaModal } from './solana-interface'

import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { type Connector } from '@web3modal/core'

type SolanaAuthClientConfig = {
  modal: ISolanaModal
  projectId: string
}

export class SolanaAuthClient {
  private authProvider: W3mFrameProvider
  private modal: ISolanaModal

  constructor({ modal, projectId }: SolanaAuthClientConfig) {
    this.modal = modal
    this.authProvider = new W3mFrameProvider(
      projectId,
      modal.getChainId() as W3mFrameTypes.Network['chainId']
    )
  }

  public getConnector(): Connector {
    return {
      id: ConstantsUtil.AUTH_CONNECTOR_ID,
      type: 'AUTH',
      name: 'Auth',
      provider: this.authProvider,
      email: true,
      socials: ['apple', 'discord', 'github'],
      showWallets: true,
      chain: CommonConstantsUtil.CHAIN.SOLANA,
      walletFeatures: true
    }
  }

  public async connect() {
    try {
      this.modal.setLoading(true)

      const {
        address,
        chainId,
        smartAccountDeployed,
        preferredAccountType,
        accounts = []
      } = await this.authProvider.connect({ chainId: this.modal.getChainId() })

      const { smartAccountEnabledNetworks } =
        await this.authProvider.getSmartAccountEnabledNetworks()

      this.modal.handleConnection({
        connectorId: ConstantsUtil.AUTH_CONNECTOR_ID,
        caipChainId: chainId as string,
        providerType: ConstantsUtil.AUTH_CONNECTOR_ID,
        provider: this.authProvider as CombinedProvider,
        address,
        accounts:
          accounts.length > 0
            ? accounts
            : [{ address, type: preferredAccountType as 'eoa' | 'smartAccount' }],
        smartAccountEnabledNetworks,
        smartAccountDeployed
      })

      this.watchAuth()
      this.watchModal()
    } finally {
      this.modal.setLoading(false)
    }
  }

  public switchNetwork(chainId: W3mFrameTypes.Network['chainId']) {
    return this.authProvider.switchNetwork(chainId)
  }

  private watchAuth() {
    console.log('watchAuth')

    this.authProvider.onRpcRequest(request => {
      console.log('onRpcRequest', request)

      if (
        W3mFrameHelpers.checkIfRequestExists(request) &&
        !W3mFrameHelpers.checkIfRequestIsAllowed(request)
      ) {
        if (this.modal.isOpen()) {
          if (this.modal.isTransactionStackEmpty()) {
            return
          }
          if (this.modal.isTransactionShouldReplaceView()) {
            this.modal.replace('ApproveTransaction')
          } else {
            this.modal.redirect('ApproveTransaction')
          }
        } else {
          this.modal.open({ view: 'ApproveTransaction' })
        }
      } else {
        this.modal.open()
        const method = W3mFrameHelpers.getRequestMethod(request)
        // eslint-disable-next-line no-console
        console.error(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_MESSAGE, { method })
        setTimeout(() => {
          this.modal.showErrorMessage(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_UI_MESSAGE)
        }, 300)
      }
    })

    this.authProvider.onRpcResponse(response => {
      console.log('onRpcResponse', response)

      const responseType = W3mFrameHelpers.getResponseType(response)

      switch (responseType) {
        case W3mFrameConstants.RPC_RESPONSE_TYPE_ERROR: {
          if (this.modal.isOpen()) {
            if (this.modal.isTransactionStackEmpty()) {
              this.modal.close()
            } else {
              this.modal.popTransactionStack(true)
            }
          }
          break
        }
        case W3mFrameConstants.RPC_RESPONSE_TYPE_TX: {
          if (this.modal.isTransactionStackEmpty()) {
            this.modal.close()
          } else {
            this.modal.popTransactionStack()
          }
          break
        }
        default:
          break
      }
    })

    this.authProvider.onNotConnected(() => {
      this.modal.setIsConnected(false)
      this.modal.setLoading(false)
    })

    this.authProvider.onIsConnected(
      ({ address, chainId, accounts = [], smartAccountDeployed, preferredAccountType }) => {
        console.log('onIsConnected (event)', address, chainId, accounts, smartAccountDeployed)

        if (typeof chainId === 'number') {
          throw new Error('Invalid chain id')
        }

        this.modal.handleConnection({
          connectorId: ConstantsUtil.AUTH_CONNECTOR_ID,
          caipChainId: chainId,
          providerType: ConstantsUtil.AUTH_CONNECTOR_ID,
          provider: this.authProvider as CombinedProvider,
          address,
          accounts:
            accounts.length > 0
              ? accounts
              : [{ address, type: preferredAccountType as 'eoa' | 'smartAccount' }],
          smartAccountDeployed
        })
      }
    )

    this.authProvider.onSetPreferredAccount(({ address }) => {
      if (!address) {
        return
      }
      this.modal.setLoading(true)
      this.modal
        .handleConnection({
          address,
          caipChainId: this.modal.getCaipNetwork()?.id as string,
          connectorId: ConstantsUtil.AUTH_CONNECTOR_ID,
          provider: this.authProvider as CombinedProvider,
          providerType: ConstantsUtil.AUTH_CONNECTOR_ID
        })
        .finally(() => this.modal.setLoading(false))
    })
  }

  private watchModal() {
    if (this.authProvider) {
      this.modal.subscribeState(val => {
        if (!val.open) {
          this.authProvider?.rejectRpcRequest()
        }
      })
    }
  }
}
