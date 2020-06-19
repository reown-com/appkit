import { IAbstractConnectorOptions, getChainId } from "../../helpers";

export interface IWalletConnectConnectorOptions
  extends IAbstractConnectorOptions {
  infuraId?: string;
  rpc?: { [chainId: number]: string };
  bridge?: string;
  qrcode?: boolean;
}

export const getProvider = async (
  WalletConnectProvider: any,
  opts: IWalletConnectConnectorOptions
) => {
  let bridge = "https://bridge.walletconnect.org";
  let qrcode = true;
  let infuraId = "";
  let rpc = undefined;
  let chainId = 1;
  if (opts) {
    bridge = opts.bridge || bridge;
    qrcode = typeof opts.qrcode !== "undefined" ? opts.qrcode : qrcode;
    infuraId = opts.infuraId || "";
    rpc = opts.rpc || undefined;
    chainId =
      opts.network && getChainId(opts.network) ? getChainId(opts.network) : 1;
  }

  const provider = new WalletConnectProvider({
    bridge,
    qrcode,
    infuraId,
    rpc,
    chainId
  });
  return provider;
};

export const enableProvider = async (
  WalletConnectProvider: any,
  opts: IWalletConnectConnectorOptions
) => {
  const provider = await getProvider(WalletConnectProvider, opts);
  await provider.enable();
  return provider;
};
