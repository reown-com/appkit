import type { LibraryOptions, PublicStateControllerState, Token } from '@web3modal/scaffold';
import { Web3ModalScaffold } from '@web3modal/scaffold';
import type { Web3ModalSIWEClient } from '@web3modal/siwe';
import type { ProviderType, Chain, EthersStoreUtilState } from '@web3modal/scaffold-utils/ethers';
import type { Eip1193Provider } from 'ethers';
export type EthereumHelpers = {
    getAddress: (address: string) => string;
    getENS: (address: string) => Promise<string | undefined>;
    getAvatar: (address: string) => Promise<string | undefined> | undefined;
    getBalance: ({ chain, address }: {
        chain: Chain;
        address: string;
    }) => Promise<string>;
};
export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
    ethereumHelpers: EthereumHelpers;
    connectorsConfig: ProviderType;
    siweConfig?: Web3ModalSIWEClient;
    chains?: Chain[];
    defaultChain?: Chain;
    chainImages?: Record<number, string>;
    connectorImages?: Record<string, string>;
    tokens?: Record<number, Token>;
}
export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion' | 'ethereumHelpers'>;
declare global {
    interface Window {
        ethereum?: Record<string, unknown>;
    }
}
interface Web3ModalState extends PublicStateControllerState {
    selectedNetworkId: number | undefined;
}
export declare class Web3Modal extends Web3ModalScaffold {
    private hasSyncedConnectedAccount;
    private ethereumHelpers;
    private EIP6963Providers;
    private walletConnectProvider?;
    private walletConnectProviderInitPromise?;
    private projectId;
    private chains?;
    private metadata?;
    private options;
    constructor(options: Web3ModalClientOptions);
    getState(): {
        selectedNetworkId: any;
        open: boolean;
    };
    subscribeState(callback: (state: Web3ModalState) => void): () => void;
    setAddress(address?: string): void;
    getAddress(): string | undefined;
    getChainId(): any;
    getIsConnected(): any;
    getWalletProvider(): Eip1193Provider | undefined;
    getWalletProviderType(): any;
    subscribeProvider(callback: (newState: EthersStoreUtilState) => void): any;
    disconnect(): Promise<void>;
    private createProvider;
    private initWalletConnectProvider;
    private getWalletConnectProvider;
    private syncRequestedNetworks;
    private checkActiveWalletConnectProvider;
    private checkActiveInjectedProvider;
    private checkActiveCoinbaseProvider;
    private checkActive6963Provider;
    private setWalletConnectProvider;
    private setInjectedProvider;
    private setEIP6963Provider;
    private setCoinbaseProvider;
    private watchWalletConnect;
    private watchInjected;
    private watchEIP6963;
    private watchCoinbase;
    private syncAccount;
    private syncNetwork;
    private syncProfile;
    private syncBalance;
    private switchNetwork;
    private syncConnectors;
    private eip6963EventHandler;
    private listenConnectors;
}
export {};
