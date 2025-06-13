import { EnsController } from '@reown/appkit-controllers';
import { solana, solanaDevnet } from '../networks/index.js';
export const DEFAULT_METHODS = {
    solana: [
        'solana_signMessage',
        'solana_signTransaction',
        'solana_requestAccounts',
        'solana_getAccounts',
        'solana_signAllTransactions',
        'solana_signAndSendTransaction'
    ],
    eip155: [
        'eth_accounts',
        'eth_requestAccounts',
        'eth_sendRawTransaction',
        'eth_sign',
        'eth_signTransaction',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
        'eth_sendTransaction',
        'personal_sign',
        'wallet_switchEthereumChain',
        'wallet_addEthereumChain',
        'wallet_getPermissions',
        'wallet_requestPermissions',
        'wallet_registerOnboarding',
        'wallet_watchAsset',
        'wallet_scanQRCode',
        'wallet_getCallsStatus',
        'wallet_showCallsStatus',
        'wallet_sendCalls',
        'wallet_getCapabilities',
        'wallet_grantPermissions',
        'wallet_revokePermissions',
        'wallet_getAssets'
    ],
    bip122: ['sendTransfer', 'signMessage', 'signPsbt', 'getAccountAddresses']
};
export const WcHelpersUtil = {
    getMethodsByChainNamespace(chainNamespace) {
        return DEFAULT_METHODS[chainNamespace] || [];
    },
    createDefaultNamespace(chainNamespace) {
        return {
            methods: this.getMethodsByChainNamespace(chainNamespace),
            events: ['accountsChanged', 'chainChanged'],
            chains: [],
            rpcMap: {}
        };
    },
    applyNamespaceOverrides(baseNamespaces, overrides) {
        if (!overrides) {
            return { ...baseNamespaces };
        }
        const result = { ...baseNamespaces };
        const namespacesToOverride = new Set();
        if (overrides.methods) {
            Object.keys(overrides.methods).forEach(ns => namespacesToOverride.add(ns));
        }
        if (overrides.chains) {
            Object.keys(overrides.chains).forEach(ns => namespacesToOverride.add(ns));
        }
        if (overrides.events) {
            Object.keys(overrides.events).forEach(ns => namespacesToOverride.add(ns));
        }
        if (overrides.rpcMap) {
            Object.keys(overrides.rpcMap).forEach(chainId => {
                const [ns] = chainId.split(':');
                if (ns) {
                    namespacesToOverride.add(ns);
                }
            });
        }
        namespacesToOverride.forEach(ns => {
            if (!result[ns]) {
                result[ns] = this.createDefaultNamespace(ns);
            }
        });
        if (overrides.methods) {
            Object.entries(overrides.methods).forEach(([ns, methods]) => {
                if (result[ns]) {
                    result[ns].methods = methods;
                }
            });
        }
        if (overrides.chains) {
            Object.entries(overrides.chains).forEach(([ns, chains]) => {
                if (result[ns]) {
                    result[ns].chains = chains;
                }
            });
        }
        if (overrides.events) {
            Object.entries(overrides.events).forEach(([ns, events]) => {
                if (result[ns]) {
                    result[ns].events = events;
                }
            });
        }
        if (overrides.rpcMap) {
            const processedNamespaces = new Set();
            Object.entries(overrides.rpcMap).forEach(([chainId, rpcUrl]) => {
                const [ns, id] = chainId.split(':');
                if (!ns || !id || !result[ns]) {
                    return;
                }
                if (!result[ns].rpcMap) {
                    result[ns].rpcMap = {};
                }
                if (!processedNamespaces.has(ns)) {
                    result[ns].rpcMap = {};
                    processedNamespaces.add(ns);
                }
                result[ns].rpcMap[id] = rpcUrl;
            });
        }
        return result;
    },
    createNamespaces(caipNetworks, configOverride) {
        const defaultNamespaces = caipNetworks.reduce((acc, chain) => {
            const { id, chainNamespace, rpcUrls } = chain;
            const rpcUrl = rpcUrls.default.http[0];
            if (!acc[chainNamespace]) {
                acc[chainNamespace] = this.createDefaultNamespace(chainNamespace);
            }
            const caipNetworkId = `${chainNamespace}:${id}`;
            const namespace = acc[chainNamespace];
            namespace.chains.push(caipNetworkId);
            switch (caipNetworkId) {
                case solana.caipNetworkId:
                    namespace.chains.push(solana.deprecatedCaipNetworkId);
                    break;
                case solanaDevnet.caipNetworkId:
                    namespace.chains.push(solanaDevnet.deprecatedCaipNetworkId);
                    break;
                default:
            }
            if (namespace?.rpcMap && rpcUrl) {
                namespace.rpcMap[id] = rpcUrl;
            }
            return acc;
        }, {});
        return this.applyNamespaceOverrides(defaultNamespaces, configOverride);
    },
    resolveReownName: async (name) => {
        const wcNameAddress = await EnsController.resolveName(name);
        const networkNameAddresses = Object.values(wcNameAddress?.addresses) || [];
        return networkNameAddresses[0]?.address || false;
    },
    getChainsFromNamespaces(namespaces = {}) {
        return Object.values(namespaces).flatMap(namespace => {
            const chains = (namespace.chains || []);
            const accountsChains = namespace.accounts.map(account => {
                const [chainNamespace, chainId] = account.split(':');
                return `${chainNamespace}:${chainId}`;
            });
            return Array.from(new Set([...chains, ...accountsChains]));
        });
    },
    isSessionEventData(data) {
        return (typeof data === 'object' &&
            data !== null &&
            'id' in data &&
            'topic' in data &&
            'params' in data &&
            typeof data.params === 'object' &&
            data.params !== null &&
            'chainId' in data.params &&
            'event' in data.params &&
            typeof data.params.event === 'object' &&
            data.params.event !== null);
    },
    isOriginAllowed(currentOrigin, allowedPatterns, defaultAllowedOrigins) {
        for (const pattern of [...allowedPatterns, ...defaultAllowedOrigins]) {
            if (pattern.includes('*')) {
                const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
                const regexString = `^${escapedPattern.replace(/\\\*/gu, '.*')}$`;
                const regex = new RegExp(regexString, 'u');
                if (regex.test(currentOrigin)) {
                    return true;
                }
            }
            else {
                try {
                    if (new URL(pattern).origin === currentOrigin) {
                        return true;
                    }
                }
                catch (e) {
                    if (pattern === currentOrigin) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
};
//# sourceMappingURL=HelpersUtil.js.map