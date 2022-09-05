import { IAbstractConnectorOptions, getChainId } from "../../helpers";

export interface IBitizenConnectConnectorOptions
  extends IAbstractConnectorOptions {
  infuraId?: string;
  rpc?: { [chainId: number]: string };
  bridge?: string;
  qrcode?: boolean;
  qrcodeModalOptions?: { mobileLinks?: string[] };
}

const ConnectToBitizenWallet = (
  BitizenConnectProvider: any,
  opts: IBitizenConnectConnectorOptions
) => {
  return new Promise(async (resolve, reject) => {
    let bridge = "https://bridge.walletconnect.org";
    let qrcode = true;
    let infuraId = "";
    let rpc = undefined;
    let chainId = 1;
    let qrcodeModalOptions = undefined;

    if (opts) {
      bridge = opts.bridge || bridge;
      qrcode = typeof opts.qrcode !== "undefined" ? opts.qrcode : qrcode;
      infuraId = opts.infuraId || "";
      rpc = opts.rpc || undefined;
      chainId =
        opts.network && getChainId(opts.network) ? getChainId(opts.network) : 1;
      qrcodeModalOptions = opts.qrcodeModalOptions || undefined;
    }

    const provider = new BitizenConnectProvider({
      bridge,
      qrcode,
      infuraId,
      rpc,
      chainId,
      qrcodeModalOptions
    });
    try {
      await provider.enable();
      resolve(provider);
    } catch (e) {
      reject(e);
    }
  });
};

export default ConnectToBitizenWallet;
