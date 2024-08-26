import type { CaipAddress, CaipNetworkId, ChainId, ChainNamespace } from './TypeUtil.js';
type ParsedCaipAddress = {
    chainNamespace: ChainNamespace;
    chainId: ChainId;
    address: string;
};
type ParsedCaipNetworkId = {
    chainNamespace: ChainNamespace;
    chainId: ChainId;
};
export declare const ParseUtil: {
    parseCaipAddress(caipAddress: CaipAddress): ParsedCaipAddress;
    parseCaipNetworkId(caipNetworkId: CaipNetworkId): ParsedCaipNetworkId;
};
export {};
