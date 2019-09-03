// @ts-ignore
import WalletLink from "walletlink";

export interface IWalletLinkConnectorOptions {
  appName: string;
  appLogoUrl: string;
  networkUrl: string;
  chainId: number;
}

const ConnectToWalletLink = (opts: IWalletLinkConnectorOptions) => {
  return new Promise(async (resolve, reject) => {
    let appName = "";
    let appLogoUrl = "";
    let networkUrl = "";
    let chainId = 1;

    if (opts) {
      appName = opts.appName || appName;
      appLogoUrl = opts.appLogoUrl || appLogoUrl;
      networkUrl = opts.networkUrl || networkUrl;
      chainId = opts.chainId || chainId;
    }

    const walletLink = new WalletLink({
      appName,
      appLogoUrl
    });
    const provider = walletLink.makeWeb3Provider(networkUrl, chainId);

    await provider.enable();

    resolve(provider);
  });
};

export default ConnectToWalletLink;
