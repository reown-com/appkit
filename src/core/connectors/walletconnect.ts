// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";
import { SimpleFunction } from "src/helpers/types";

export interface IWalletConnectConnectorOptions {
  bridge?: string;
  qrcode?: boolean;
  onUri?: (uri: string) => void;
}

const ConnectToWalletConnect = (opts: IWalletConnectConnectorOptions) => {
  return new Promise(async (resolve, reject) => {
    let bridge = "https://bridge.walletconnect.org";
    let qrcode = true;
    let onUri: SimpleFunction | null = null;
    const infuraId = "774b1e4252de48c3997d66ac5f5078d8";

    if (opts) {
      bridge = opts.bridge || bridge;
      qrcode = typeof opts.qrcode !== "undefined" ? opts.qrcode : qrcode;
      onUri = opts.onUri || onUri;
    }

    if (!qrcode && !onUri) {
      reject(new Error("Must provide onUri callback when qrcode is disabled"));
    }

    const provider = new WalletConnectProvider({ bridge, qrcode, infuraId });

    await provider.enable();

    resolve(provider);
  });
};

export default ConnectToWalletConnect;
