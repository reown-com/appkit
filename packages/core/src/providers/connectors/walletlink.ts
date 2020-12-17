import { IAbstractConnectorOptions, getChainId } from '../../helpers';

export interface IWalletLinkConnectorOptions
  extends IAbstractConnectorOptions {
  infuraUrl: string;
  appName?: string;
  appLogoUrl?: string;
  darkMode: boolean;
}

const ConnectToWalletLink = (
  WalletLinkProvider: any,
  opts: IWalletLinkConnectorOptions
) => {
  return new Promise(async (resolve, reject) => {
    let infuraUrl = '';
    let appName = ""
    let appLogoUrl = ""
    let darkMode = false
    let chainId = 1;

    if (opts) {
      appName = opts.appName || appName;
      appLogoUrl = opts.appLogoUrl || appLogoUrl;
      darkMode = opts.darkMode || darkMode;
      infuraUrl = opts.infuraUrl || '';
      chainId = opts.network && getChainId(opts.network) ? getChainId(opts.network) : 1;
    }

    if(!infuraUrl) {
      throw new Error('Missing Infura URL for WalletLink Provider')
    }

    const provider = new WalletLinkProvider({
      appName,
      appLogoUrl,
      darkMode
    }).makeWeb3Provider(infuraUrl, chainId)

    try {
      await provider.enable();
      resolve(provider);
    } catch (e) {
      reject(e);
    }
  });
};

export default ConnectToWalletLink;
