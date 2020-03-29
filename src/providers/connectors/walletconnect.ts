import { IAbstractConnectorOptions, getChainId } from "../../helpers";

export interface IWalletConnectConnectorOptions
  extends IAbstractConnectorOptions {
  infuraId: string;
  bridge?: string;
  qrcode?: boolean;
}

const ConnectToWalletConnect = (
  WalletConnectProvider: any,
  opts: IWalletConnectConnectorOptions
) => {
  return new Promise(async (resolve, reject) => {
    let bridge = "https://bridge.walletconnect.org";
    let qrcode = true;
    let infuraId = "";
    let chainId = 1;

    if (opts) {
      bridge = opts.bridge || bridge;
      qrcode = typeof opts.qrcode !== "undefined" ? opts.qrcode : qrcode;
      infuraId = opts.infuraId || "";
      chainId = opts.network ? getChainId(opts.network) : 1;
    }

    const provider = new WalletConnectProvider({
      bridge,
      qrcode,
      infuraId,
      chainId
    });

    await provider.enable();

    resolve(provider);
  });
};

export default ConnectToWalletConnect;
