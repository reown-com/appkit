import '@web3modal/polyfills';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
export function defaultConfig(options) {
    const { enableEIP6963 = true, enableInjected = true, enableCoinbase = true, metadata, rpcUrl, defaultChainId } = options;
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
            darkMode: false
        });
        coinbaseProvider = coinbaseWallet.makeWeb3Provider(rpcUrl, defaultChainId);
        return coinbaseProvider;
    }
    if (enableInjected) {
        providers.injected = getInjectedProvider();
    }
    if (enableCoinbase && rpcUrl && defaultChainId) {
        providers.coinbase = getCoinbaseProvider();
    }
    if (enableEIP6963) {
        providers.EIP6963 = true;
    }
    return providers;
}
//# sourceMappingURL=defaultConfig.js.map