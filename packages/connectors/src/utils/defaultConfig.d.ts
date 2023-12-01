import '@web3modal/polyfills';
import type { Metadata } from '@web3modal/scaffold-utils/ethers';
export interface ConfigOptions {
    enableEIP6963?: boolean;
    enableInjected?: boolean;
    enableCoinbase?: boolean;
    rpcUrl?: string;
    defaultChainId?: number;
    metadata: Metadata;
}
export declare function defaultConfig(options: ConfigOptions): ProviderType;
