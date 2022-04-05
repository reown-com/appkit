import { IAbstractConnectorOptions } from "../../helpers";

export interface ICoinbaseWalletSdkConnectorOptions
  extends IAbstractConnectorOptions {
  infuraId?: string;
  rpc?: { [chainId: number]: string };
  chainId?: number;
  appName?: string;
  appLogoUrl?: string;
  darkMode?: boolean;
}

const ConnectToCoinbaseWalletSdk = (
  CoinbaseWalletSdk: any,
  opts: ICoinbaseWalletSdkConnectorOptions
) => {
  return new Promise(async (resolve, reject) => {
    const options = opts || {};
    const infuraId = options.infuraId || "";
    const chainId = options.chainId || 1;
    const appName = options.appName || "";
    const appLogoUrl = options.appLogoUrl;
    const darkMode = options.darkMode || false;

    let rpc = options.rpc || undefined;
    if (options.infuraId && !options.rpc) {
      rpc = `https://mainnet.infura.io/v3/${infuraId}`;
    }

    const coinbaseWalletSdk = new CoinbaseWalletSdk({
      appName,
      appLogoUrl,
      darkMode
    });

    try {
      const provider = coinbaseWalletSdk.makeWeb3Provider(rpc, chainId);
      await provider.send("eth_requestAccounts");
      resolve(provider);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * @deprecated WalletLink is deprecated in favor of CoinbaseWalletSdk
 */
export const walletlink = ConnectToCoinbaseWalletSdk;
export default ConnectToCoinbaseWalletSdk;
