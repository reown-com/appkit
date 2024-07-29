import type { AccountType, Web3ModalScaffold } from 'packages/scaffold'
import type { Provider, SolStoreUtilState } from './utils/scaffold'

export interface ISolanaModal extends Web3ModalScaffold {
  getChainId(): string | number | undefined

  handleConnection(params: ISolanaModal.HandleConnectionParams): Promise<void>
}

export namespace ISolanaModal {
  export type HandleConnectionParams = {
    connectorId: string
    caipChainId: string
    providerType: SolStoreUtilState['providerType']
    provider: Provider
    address: string
    accounts?: AccountType[]
    smartAccountEnabledNetworks?: number[]
    smartAccountDeployed?: boolean
  }
}
