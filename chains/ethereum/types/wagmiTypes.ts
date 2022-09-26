import type { Web3ModalEthereum } from '../src/api'

export type { Chain, ChainProviderFn, Connector } from '@wagmi/core'

export type FetchBalanceArgs = Parameters<typeof Web3ModalEthereum.fetchBalance>[0]

export type FetchEnsAddressArgs = Parameters<typeof Web3ModalEthereum.fetchEnsAddress>

export type FetchEnsAvatarArgs = Parameters<typeof Web3ModalEthereum.fetchEnsAvatar>

export type FetchEnsNameArgs = Parameters<typeof Web3ModalEthereum.fetchEnsName>

export type FetchEnsResolverArgs = Parameters<typeof Web3ModalEthereum.fetchEnsResolver>

export type FetchSignerArgs = Parameters<typeof Web3ModalEthereum.fetchSigner>

export type FetchTokenArgs = Parameters<typeof Web3ModalEthereum.fetchToken>

export type FetchTransactionArgs = Parameters<typeof Web3ModalEthereum.fetchTransaction>

export type GetContractArgs = Parameters<typeof Web3ModalEthereum.getContract>

export type GetNetworkArgs = Parameters<typeof Web3ModalEthereum.getNetwork>

export type GetProviderArgs = Parameters<typeof Web3ModalEthereum.getProvider>

export type PrepareSendTransactionArgs = Parameters<typeof Web3ModalEthereum.prepareSendTransaction>

export type PrepareWriteContractArgs = Parameters<typeof Web3ModalEthereum.prepareWriteContract>

export type ReadContractArgs = Parameters<typeof Web3ModalEthereum.readContract>

export type SendTransactionArgs = Parameters<typeof Web3ModalEthereum.sendTransaction>

export type SignMessageArgs = Parameters<typeof Web3ModalEthereum.signMessage>

export type SignTypedDataArgs = Parameters<typeof Web3ModalEthereum.signTypedData>

export type SwitchNetworkArgs = Parameters<typeof Web3ModalEthereum.switchNetwork>

export type WaitForTransactionArgs = Parameters<typeof Web3ModalEthereum.waitForTransaction>

export type WatchReadContractArgs = Parameters<typeof Web3ModalEthereum.watchReadContract>

export type WriteContractArgs = Parameters<typeof Web3ModalEthereum.writeContract>

export type WathBlockNumberArgs = Parameters<typeof Web3ModalEthereum.watchBlockNumber>
