import type { ChainNamespace } from './TypeUtil.js';
export declare const ConstantsUtil: {
    WC_NAME_SUFFIX: string;
    BLOCKCHAIN_API_RPC_URL: string;
    PULSE_API_URL: string;
    W3M_API_URL: string;
    CHAIN: {
        EVM: ChainNamespace;
        SOLANA: ChainNamespace;
    };
    CHAIN_NAME_MAP: {
        eip155: string;
        solana: string;
    };
};
