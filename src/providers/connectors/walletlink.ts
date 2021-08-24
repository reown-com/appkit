import { IAbstractConnectorOptions } from "../../helpers";

export interface IWalletLinkConnectorOptions extends IAbstractConnectorOptions {
  appName: string;
  appLogoUrl?: string;
  darkMode?: boolean;
  walletLinkUrl?: string;
  jsonRpcUrl: string;
  chainId?: number;
}

const ConnectToWalletLink = (
  WalletLink: any,
  opts: IWalletLinkConnectorOptions
) => {
  return new Promise(async (resolve, reject) => {
    const appName = opts.appName;
    const appLogoUrl = opts.appLogoUrl;
    const darkMode = opts.darkMode;
    const walletLinkUrl = opts.walletLinkUrl;
    const jsonRpcUrl = opts.jsonRpcUrl;
    const chainId = typeof opts.chainId !== "undefined" ? opts.chainId : 1;

    try {
      const provider = new WalletLink({
        appName,
        appLogoUrl,
        darkMode,
        walletLinkUrl
      }).makeWeb3Provider(jsonRpcUrl, chainId);

      await provider.send("eth_requestAccounts");
      resolve(provider);
    } catch (error) {
      reject(error);
    }
  });
};

export default ConnectToWalletLink;
