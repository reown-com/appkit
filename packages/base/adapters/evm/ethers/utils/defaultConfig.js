import '@web3modal/polyfills';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
export function defaultConfig(options) {
    const { enableEIP6963 = true, enableCoinbase = true, enableInjected = true, auth = {
        email: true,
        showWallets: true,
        walletFeatures: true
    }, metadata } = options;
    let injectedProvider = undefined;
    let coinbaseProvider = undefined;
    const providers = { metadata };
    function getInjectedProvider() {
        if (injectedProvider) {
            return injectedProvider;
        }
        if (typeof window === 'undefined') {
            return undefined;
        }
        if (!window.ethereum) {
            return undefined;
        }
        injectedProvider = window.ethereum;
        return injectedProvider;
    }
    function getCoinbaseProvider() {
        if (coinbaseProvider) {
            return coinbaseProvider;
        }
        if (typeof window === 'undefined') {
            return undefined;
        }
        const coinbaseWallet = new CoinbaseWalletSDK({
            appName: metadata.name,
            appLogoUrl: metadata.icons[0],
            appChainIds: options.chains?.map(chain => chain.chainId) || [1, 84532]
        });
        coinbaseProvider = coinbaseWallet.makeWeb3Provider({
            options: options.coinbasePreference || 'all'
        });
        return coinbaseProvider;
    }
    if (enableInjected) {
        providers.injected = getInjectedProvider();
    }
    if (enableCoinbase) {
        providers.coinbase = getCoinbaseProvider();
    }
    if (enableEIP6963) {
        providers.EIP6963 = true;
    }
    if (auth) {
        auth.email ??= true;
        auth.showWallets ??= true;
        auth.walletFeatures ??= true;
        providers.auth = auth;
    }
    return providers;
}
//# sourceMappingURL=defaultConfig.js.map