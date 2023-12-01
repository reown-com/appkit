import { Web3ModalScaffold } from '@web3modal/scaffold';
import { ConstantsUtil, PresetsUtil, HelpersUtil } from '@web3modal/scaffold-utils';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { EthersConstantsUtil, EthersHelpersUtil, EthersStoreUtil } from '@web3modal/scaffold-utils/ethers';
export class Web3Modal extends Web3ModalScaffold {
    constructor(options) {
        const { siweConfig, ethereumHelpers, connectorsConfig, chains, defaultChain, tokens, chainImages, _sdkVersion, ...w3mOptions } = options;
        if (!connectorsConfig) {
            throw new Error('web3modal:constructor - connectorsConfig is undefined');
        }
        if (!w3mOptions.projectId) {
            throw new Error('web3modal:constructor - projectId is undefined');
        }
        const networkControllerClient = {
            switchCaipNetwork: async (caipNetwork) => {
                const chainId = HelpersUtil.caipNetworkIdToNumber(caipNetwork?.id);
                if (chainId) {
                    await this.switchNetwork(chainId);
                }
            },
            getApprovedCaipNetworksData: async () => new Promise(async (resolve) => {
                const walletChoice = localStorage.getItem(EthersConstantsUtil.WALLET_ID);
                if (walletChoice?.includes(ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID)) {
                    const provider = await this.getWalletConnectProvider();
                    if (!provider) {
                        throw new Error('networkControllerClient:getApprovedCaipNetworks - connector is undefined');
                    }
                    const ns = provider.signer?.session?.namespaces;
                    const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods;
                    const nsChains = ns?.[ConstantsUtil.EIP155]?.chains;
                    const result = {
                        supportsAllNetworks: nsMethods?.includes(ConstantsUtil.ADD_CHAIN_METHOD) ?? false,
                        approvedCaipNetworkIds: nsChains
                    };
                    resolve(result);
                }
                else {
                    const result = {
                        approvedCaipNetworkIds: undefined,
                        supportsAllNetworks: true
                    };
                    resolve(result);
                }
            })
        };
        const connectionControllerClient = {
            connectWalletConnect: async (onUri) => {
                const WalletConnectProvider = await this.getWalletConnectProvider();
                if (!WalletConnectProvider) {
                    throw new Error('connectionControllerClient:getWalletConnectUri - provider is undefined');
                }
                WalletConnectProvider.on('display_uri', (uri) => {
                    onUri(uri);
                });
                await WalletConnectProvider.connect();
                await this.setWalletConnectProvider();
            },
            connectExternal: async ({ id, info, provider }) => {
                if (id === ConstantsUtil.INJECTED_CONNECTOR_ID) {
                    const InjectedProvider = connectorsConfig.injected;
                    if (!InjectedProvider) {
                        throw new Error('connectionControllerClient:connectInjected - provider is undefined');
                    }
                    await InjectedProvider.request({ method: 'eth_requestAccounts' });
                    this.setInjectedProvider(connectorsConfig);
                }
                else if (id === ConstantsUtil.EIP6963_CONNECTOR_ID && info && provider) {
                    await provider.request({ method: 'eth_requestAccounts' });
                    this.setEIP6963Provider(provider, info.name);
                }
                else if (id === ConstantsUtil.COINBASE_CONNECTOR_ID) {
                    const CoinbaseProvider = connectorsConfig.coinbase;
                    if (!CoinbaseProvider) {
                        throw new Error('connectionControllerClient:connectCoinbase - connector is undefined');
                    }
                    await CoinbaseProvider.request({ method: 'eth_requestAccounts' });
                    this.setCoinbaseProvider(connectorsConfig);
                }
            },
            checkInstalled(ids) {
                if (!ids) {
                    return Boolean(window.ethereum);
                }
                if (connectorsConfig.injected) {
                    if (!window?.ethereum) {
                        return false;
                    }
                }
                return ids.some(id => Boolean(window.ethereum?.[String(id)]));
            },
            disconnect: async () => {
                const provider = EthersStoreUtil.state.provider;
                const providerType = EthersStoreUtil.state.providerType;
                localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
                EthersStoreUtil.reset();
                if (siweConfig?.options?.signOutOnDisconnect) {
                    await siweConfig.signOut();
                }
                if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
                    const WalletConnectProvider = provider;
                    await WalletConnectProvider.disconnect();
                }
                provider?.emit('disconnect');
            },
            signMessage: async (message) => {
                const provider = EthersStoreUtil.state.provider;
                if (!provider) {
                    throw new Error('connectionControllerClient:signMessage - provider is undefined');
                }
                const signature = await provider.request({
                    method: 'personal_sign',
                    params: [message, this.getAddress()]
                });
                return signature;
            }
        };
        super({
            networkControllerClient,
            connectionControllerClient,
            siweControllerClient: siweConfig,
            defaultChain: EthersHelpersUtil.getCaipDefaultChain(defaultChain),
            tokens: HelpersUtil.getCaipTokens(tokens),
            _sdkVersion: _sdkVersion ?? `html-ethers-${ConstantsUtil.VERSION}`,
            ...w3mOptions
        });
        this.hasSyncedConnectedAccount = false;
        this.EIP6963Providers = [];
        this.options = undefined;
        this.ethereumHelpers = ethereumHelpers;
        this.options = options;
        this.metadata = connectorsConfig.metadata;
        this.projectId = w3mOptions.projectId;
        this.chains = chains;
        this.createProvider();
        EthersStoreUtil.subscribeKey('address', () => {
            this.syncAccount();
        });
        EthersStoreUtil.subscribeKey('chainId', () => {
            this.syncNetwork(chainImages);
        });
        this.syncRequestedNetworks(chains, chainImages);
        this.syncConnectors(connectorsConfig);
        if (connectorsConfig.EIP6963) {
            if (typeof window !== 'undefined') {
                this.listenConnectors(connectorsConfig.EIP6963);
                this.checkActive6963Provider();
            }
        }
        if (connectorsConfig.injected) {
            this.checkActiveInjectedProvider(connectorsConfig);
        }
        if (connectorsConfig.coinbase) {
            this.checkActiveCoinbaseProvider(connectorsConfig);
        }
    }
    getState() {
        const state = super.getState();
        return {
            ...state,
            selectedNetworkId: HelpersUtil.caipNetworkIdToNumber(state.selectedNetworkId)
        };
    }
    subscribeState(callback) {
        return super.subscribeState(state => callback({
            ...state,
            selectedNetworkId: HelpersUtil.caipNetworkIdToNumber(state.selectedNetworkId)
        }));
    }
    setAddress(address) {
        const originalAddress = address
            ? this.ethereumHelpers.getAddress(address)
            : undefined;
        EthersStoreUtil.setAddress(originalAddress);
    }
    getAddress() {
        const { address } = EthersStoreUtil.state;
        return address ? this.ethereumHelpers.getAddress(address) : undefined;
    }
    getChainId() {
        return EthersStoreUtil.state.chainId;
    }
    getIsConnected() {
        return EthersStoreUtil.state.isConnected;
    }
    getWalletProvider() {
        return EthersStoreUtil.state.provider;
    }
    getWalletProviderType() {
        return EthersStoreUtil.state.providerType;
    }
    subscribeProvider(callback) {
        return EthersStoreUtil.subscribe(callback);
    }
    async disconnect() {
        const { provider, providerType } = EthersStoreUtil.state;
        localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
        EthersStoreUtil.reset();
        if (providerType === 'injected' || providerType === 'eip6963') {
            provider?.emit('disconnect');
        }
        else {
            await provider.disconnect();
        }
    }
    createProvider() {
        if (!this.walletConnectProviderInitPromise && typeof window !== 'undefined') {
            this.walletConnectProviderInitPromise = this.initWalletConnectProvider();
        }
        return this.walletConnectProviderInitPromise;
    }
    async initWalletConnectProvider() {
        const walletConnectProviderOptions = {
            projectId: this.projectId,
            showQrModal: false,
            rpcMap: this.chains
                ? this.chains.reduce((map, chain) => {
                    map[chain.chainId] = chain.rpcUrl;
                    return map;
                }, {})
                : {},
            optionalChains: this.chains ? [0, ...this.chains.map(chain => chain.chainId)] : [0],
            metadata: {
                name: this.metadata ? this.metadata.name : '',
                description: this.metadata ? this.metadata.description : '',
                url: this.metadata ? this.metadata.url : '',
                icons: this.metadata ? this.metadata.icons : ['']
            }
        };
        this.walletConnectProvider = await EthereumProvider.init(walletConnectProviderOptions);
        await this.checkActiveWalletConnectProvider();
    }
    async getWalletConnectProvider() {
        if (!this.walletConnectProvider) {
            await this.createProvider();
        }
        return this.walletConnectProvider;
    }
    syncRequestedNetworks(chains, chainImages) {
        const requestedCaipNetworks = chains?.map(chain => ({
            id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
            name: chain.name,
            imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
            imageUrl: chainImages?.[chain.chainId]
        }));
        this.setRequestedCaipNetworks(requestedCaipNetworks ?? []);
    }
    async checkActiveWalletConnectProvider() {
        const WalletConnectProvider = await this.getWalletConnectProvider();
        const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID);
        if (WalletConnectProvider) {
            if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
                await this.setWalletConnectProvider();
            }
        }
    }
    checkActiveInjectedProvider(config) {
        const InjectedProvider = config.injected;
        const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID);
        if (InjectedProvider) {
            if (walletId === ConstantsUtil.INJECTED_CONNECTOR_ID) {
                this.setInjectedProvider(config);
                this.watchInjected(config);
            }
        }
    }
    checkActiveCoinbaseProvider(config) {
        const CoinbaseProvider = config.coinbase;
        const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID);
        if (CoinbaseProvider) {
            if (walletId === ConstantsUtil.COINBASE_CONNECTOR_ID) {
                if (CoinbaseProvider._addresses && CoinbaseProvider._addresses?.length > 0) {
                    this.setCoinbaseProvider(config);
                    this.watchCoinbase(config);
                }
                else {
                    localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
                    EthersStoreUtil.reset();
                }
            }
        }
    }
    checkActive6963Provider() {
        const currentActiveWallet = window?.localStorage.getItem(EthersConstantsUtil.WALLET_ID);
        if (currentActiveWallet) {
            const currentProvider = this.EIP6963Providers.find(provider => provider.name === currentActiveWallet);
            if (currentProvider) {
                this.setEIP6963Provider(currentProvider.provider, currentProvider.name);
            }
        }
    }
    async setWalletConnectProvider() {
        window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID);
        const WalletConnectProvider = await this.getWalletConnectProvider();
        if (WalletConnectProvider) {
            EthersStoreUtil.setChainId(WalletConnectProvider.chainId);
            EthersStoreUtil.setProviderType('walletConnect');
            EthersStoreUtil.setProvider(WalletConnectProvider);
            EthersStoreUtil.setIsConnected(true);
            this.setAddress(WalletConnectProvider.accounts?.[0]);
            this.watchWalletConnect();
        }
    }
    async setInjectedProvider(config) {
        window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.INJECTED_CONNECTOR_ID);
        const InjectedProvider = config.injected;
        if (InjectedProvider) {
            const { address, chainId } = await EthersHelpersUtil.getUserInfo(InjectedProvider);
            if (address && chainId) {
                EthersStoreUtil.setChainId(chainId);
                EthersStoreUtil.setProviderType('injected');
                EthersStoreUtil.setProvider(config.injected);
                EthersStoreUtil.setIsConnected(true);
                this.setAddress(address);
                this.watchCoinbase(config);
            }
        }
    }
    async setEIP6963Provider(provider, name) {
        window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, name);
        if (provider) {
            const { address, chainId } = await EthersHelpersUtil.getUserInfo(provider);
            if (address && chainId) {
                EthersStoreUtil.setChainId(chainId);
                EthersStoreUtil.setProviderType('eip6963');
                EthersStoreUtil.setProvider(provider);
                EthersStoreUtil.setIsConnected(true);
                this.setAddress(address);
                this.watchEIP6963(provider);
            }
        }
    }
    async setCoinbaseProvider(config) {
        window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.COINBASE_CONNECTOR_ID);
        const CoinbaseProvider = config.coinbase;
        if (CoinbaseProvider) {
            const { address, chainId } = await EthersHelpersUtil.getUserInfo(CoinbaseProvider);
            if (address && chainId) {
                EthersStoreUtil.setChainId(chainId);
                EthersStoreUtil.setProviderType('coinbaseWallet');
                EthersStoreUtil.setProvider(config.coinbase);
                EthersStoreUtil.setIsConnected(true);
                this.setAddress(address);
                this.watchCoinbase(config);
            }
        }
    }
    async watchWalletConnect() {
        const provider = await this.getWalletConnectProvider();
        function disconnectHandler() {
            localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
            EthersStoreUtil.reset();
            provider?.removeListener('disconnect', disconnectHandler);
            provider?.removeListener('accountsChanged', accountsChangedHandler);
            provider?.removeListener('chainChanged', chainChangedHandler);
        }
        function chainChangedHandler(chainId) {
            if (chainId) {
                const chain = EthersHelpersUtil.hexStringToNumber(chainId);
                EthersStoreUtil.setChainId(chain);
            }
        }
        const accountsChangedHandler = async (accounts) => {
            if (accounts.length > 0) {
                await this.setWalletConnectProvider();
            }
        };
        if (provider) {
            provider.on('disconnect', disconnectHandler);
            provider.on('accountsChanged', accountsChangedHandler);
            provider.on('chainChanged', chainChangedHandler);
        }
    }
    watchInjected(config) {
        const provider = config.injected;
        const getAddress = this.ethereumHelpers.getAddress;
        function disconnectHandler() {
            localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
            EthersStoreUtil.reset();
            provider?.removeListener('disconnect', disconnectHandler);
            provider?.removeListener('accountsChanged', accountsChangedHandler);
            provider?.removeListener('chainChanged', chainChangedHandler);
        }
        function accountsChangedHandler(accounts) {
            const currentAccount = accounts?.[0];
            if (currentAccount) {
                EthersStoreUtil.setAddress(getAddress(currentAccount));
            }
            else {
                localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
                EthersStoreUtil.reset();
            }
        }
        function chainChangedHandler(chainId) {
            if (chainId) {
                const chain = typeof chainId === 'string'
                    ? EthersHelpersUtil.hexStringToNumber(chainId)
                    : Number(chainId);
                EthersStoreUtil.setChainId(chain);
            }
        }
        if (provider) {
            provider.on('disconnect', disconnectHandler);
            provider.on('accountsChanged', accountsChangedHandler);
            provider.on('chainChanged', chainChangedHandler);
        }
    }
    watchEIP6963(provider) {
        const getAddress = this.ethereumHelpers.getAddress;
        function disconnectHandler() {
            localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
            EthersStoreUtil.reset();
            provider.removeListener('disconnect', disconnectHandler);
            provider.removeListener('accountsChanged', accountsChangedHandler);
            provider.removeListener('chainChanged', chainChangedHandler);
        }
        function accountsChangedHandler(accounts) {
            const currentAccount = accounts?.[0];
            if (currentAccount) {
                EthersStoreUtil.setAddress(getAddress(currentAccount));
            }
            else {
                localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
                EthersStoreUtil.reset();
            }
        }
        function chainChangedHandler(chainId) {
            if (chainId) {
                const chain = typeof chainId === 'string'
                    ? EthersHelpersUtil.hexStringToNumber(chainId)
                    : Number(chainId);
                EthersStoreUtil.setChainId(chain);
            }
        }
        if (provider) {
            provider.on('disconnect', disconnectHandler);
            provider.on('accountsChanged', accountsChangedHandler);
            provider.on('chainChanged', chainChangedHandler);
        }
    }
    watchCoinbase(config) {
        const provider = config.coinbase;
        const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID);
        const getAddress = this.ethereumHelpers.getAddress;
        function disconnectHandler() {
            localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
            EthersStoreUtil.reset();
            provider?.removeListener('disconnect', disconnectHandler);
            provider?.removeListener('accountsChanged', accountsChangedHandler);
            provider?.removeListener('chainChanged', chainChangedHandler);
        }
        function accountsChangedHandler(accounts) {
            const currentAccount = accounts?.[0];
            if (currentAccount) {
                EthersStoreUtil.setAddress(getAddress(currentAccount));
            }
            else {
                localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
                EthersStoreUtil.reset();
            }
        }
        function chainChangedHandler(chainId) {
            if (chainId && walletId === ConstantsUtil.COINBASE_CONNECTOR_ID) {
                const chain = Number(chainId);
                EthersStoreUtil.setChainId(chain);
            }
        }
        if (provider) {
            provider.on('disconnect', disconnectHandler);
            provider.on('accountsChanged', accountsChangedHandler);
            provider.on('chainChanged', chainChangedHandler);
        }
    }
    async syncAccount() {
        const address = EthersStoreUtil.state.address;
        const chainId = EthersStoreUtil.state.chainId;
        const isConnected = EthersStoreUtil.state.isConnected;
        this.resetAccount();
        if (isConnected && address && chainId) {
            const caipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`;
            this.setIsConnected(isConnected);
            this.setCaipAddress(caipAddress);
            await Promise.all([
                this.syncProfile(address),
                this.syncBalance(address),
                this.getApprovedCaipNetworksData()
            ]);
            this.hasSyncedConnectedAccount = true;
        }
        else if (!isConnected && this.hasSyncedConnectedAccount) {
            this.resetWcConnection();
            this.resetNetwork();
        }
    }
    async syncNetwork(chainImages) {
        const address = EthersStoreUtil.state.address;
        const chainId = EthersStoreUtil.state.chainId;
        const isConnected = EthersStoreUtil.state.isConnected;
        if (this.chains) {
            const chain = this.chains.find(c => c.chainId === chainId);
            if (chain) {
                const caipChainId = `${ConstantsUtil.EIP155}:${chain.chainId}`;
                this.setCaipNetwork({
                    id: caipChainId,
                    name: chain.name,
                    imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
                    imageUrl: chainImages?.[chain.chainId]
                });
                if (isConnected && address) {
                    const caipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`;
                    this.setCaipAddress(caipAddress);
                    if (chain.explorerUrl) {
                        const url = `${chain.explorerUrl}/address/${address}`;
                        this.setAddressExplorerUrl(url);
                    }
                    else {
                        this.setAddressExplorerUrl(undefined);
                    }
                    if (this.hasSyncedConnectedAccount) {
                        await this.syncBalance(address);
                    }
                }
            }
        }
    }
    async syncProfile(address) {
        const name = await this.ethereumHelpers.getENS(address);
        const avatar = await this.ethereumHelpers.getAvatar(address);
        if (name) {
            this.setProfileName(name);
        }
        if (avatar) {
            this.setProfileImage(avatar);
        }
    }
    async syncBalance(address) {
        const chainId = EthersStoreUtil.state.chainId;
        if (chainId && this.chains) {
            const chain = this.chains.find(c => c.chainId === chainId);
            if (chain) {
                const formattedBalance = await this.ethereumHelpers.getBalance({ chain, address });
                this.setBalance(formattedBalance, chain.currency);
            }
        }
    }
    async switchNetwork(chainId) {
        const provider = EthersStoreUtil.state.provider;
        const providerType = EthersStoreUtil.state.providerType;
        if (this.chains) {
            const chain = this.chains.find(c => c.chainId === chainId);
            if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID && chain) {
                const WalletConnectProvider = provider;
                if (WalletConnectProvider) {
                    try {
                        await WalletConnectProvider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
                        });
                        EthersStoreUtil.setChainId(chainId);
                    }
                    catch (switchError) {
                        if (switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
                            switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
                            switchError?.data?.originalError?.code ===
                                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID) {
                            await EthersHelpersUtil.addEthereumChain(WalletConnectProvider, chain);
                        }
                        else {
                            throw new Error('Chain is not supported');
                        }
                    }
                }
            }
            else if (providerType === ConstantsUtil.INJECTED_CONNECTOR_ID && chain) {
                const InjectedProvider = provider;
                if (InjectedProvider) {
                    try {
                        await InjectedProvider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
                        });
                        EthersStoreUtil.setChainId(chain.chainId);
                    }
                    catch (switchError) {
                        if (switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
                            switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
                            switchError?.data?.originalError?.code ===
                                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID) {
                            await EthersHelpersUtil.addEthereumChain(InjectedProvider, chain);
                        }
                        else {
                            throw new Error('Chain is not supported');
                        }
                    }
                }
            }
            else if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID && chain) {
                const EIP6963Provider = provider;
                if (EIP6963Provider) {
                    try {
                        await EIP6963Provider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
                        });
                        EthersStoreUtil.setChainId(chain.chainId);
                    }
                    catch (switchError) {
                        if (switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
                            switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
                            switchError?.data?.originalError?.code ===
                                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID) {
                            await EthersHelpersUtil.addEthereumChain(EIP6963Provider, chain);
                        }
                        else {
                            throw new Error('Chain is not supported');
                        }
                    }
                }
            }
            else if (providerType === ConstantsUtil.COINBASE_CONNECTOR_ID && chain) {
                const CoinbaseProvider = provider;
                if (CoinbaseProvider) {
                    try {
                        await CoinbaseProvider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
                        });
                        EthersStoreUtil.setChainId(chain.chainId);
                    }
                    catch (switchError) {
                        if (switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
                            switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
                            switchError?.data?.originalError?.code ===
                                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID) {
                            await EthersHelpersUtil.addEthereumChain(CoinbaseProvider, chain);
                        }
                    }
                }
            }
        }
    }
    syncConnectors(config) {
        const w3mConnectors = [];
        const connectorType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID];
        if (connectorType) {
            w3mConnectors.push({
                id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
                explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
                imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
                imageUrl: this.options?.connectorImages?.[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
                name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
                type: connectorType
            });
        }
        if (config.injected) {
            const injectedConnectorType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.INJECTED_CONNECTOR_ID];
            if (injectedConnectorType) {
                w3mConnectors.push({
                    id: ConstantsUtil.INJECTED_CONNECTOR_ID,
                    explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.INJECTED_CONNECTOR_ID],
                    imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.INJECTED_CONNECTOR_ID],
                    imageUrl: this.options?.connectorImages?.[ConstantsUtil.INJECTED_CONNECTOR_ID],
                    name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.INJECTED_CONNECTOR_ID],
                    type: injectedConnectorType
                });
            }
        }
        if (config.coinbase) {
            w3mConnectors.push({
                id: ConstantsUtil.COINBASE_CONNECTOR_ID,
                explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.COINBASE_CONNECTOR_ID],
                imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.COINBASE_CONNECTOR_ID],
                imageUrl: this.options?.connectorImages?.[ConstantsUtil.COINBASE_CONNECTOR_ID],
                name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.COINBASE_CONNECTOR_ID],
                type: 'EXTERNAL'
            });
        }
        this.setConnectors(w3mConnectors);
    }
    eip6963EventHandler(event) {
        if (event.detail) {
            const { info, provider } = event.detail;
            const connectors = this.getConnectors();
            const existingConnector = connectors.find(c => c.name === info.name);
            if (!existingConnector) {
                const type = PresetsUtil.ConnectorTypesMap[ConstantsUtil.EIP6963_CONNECTOR_ID];
                if (type) {
                    this.addConnector({
                        id: ConstantsUtil.EIP6963_CONNECTOR_ID,
                        type,
                        imageUrl: info.icon ?? this.options?.connectorImages?.[ConstantsUtil.EIP6963_CONNECTOR_ID],
                        name: info.name,
                        provider,
                        info
                    });
                    const eip6963ProviderObj = {
                        name: info.name,
                        provider
                    };
                    this.EIP6963Providers.push(eip6963ProviderObj);
                }
            }
        }
    }
    listenConnectors(enableEIP6963) {
        if (typeof window !== 'undefined' && enableEIP6963) {
            const handler = this.eip6963EventHandler.bind(this);
            window.addEventListener(ConstantsUtil.EIP6963_ANNOUNCE_EVENT, handler);
            window.dispatchEvent(new Event(ConstantsUtil.EIP6963_REQUEST_EVENT));
        }
    }
}
//# sourceMappingURL=client.js.map