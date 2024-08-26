import type { CaipNetworkId } from './TypeUtil.js';
export declare const NetworkUtil: {
    caipNetworkIdToNumber(caipnetworkId?: CaipNetworkId): number | undefined;
    parseEvmChainId(chainId: string | number): number | undefined;
};
