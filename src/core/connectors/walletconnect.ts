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
    if (opts) {
      bridge = opts.bridge || bridge;
      qrcode = typeof opts.qrcode !== "undefined" ? opts.qrcode : qrcode;
      onUri = opts.onUri || onUri;
    }
    if (!qrcode && !onUri) {
      throw new Error("Must provide onUri callback when qrcode is disabled");
    }
    const provider = new WalletConnectProvider({ bridge, qrcode });

    if (!provider._walletConnector.connected) {
      await provider._walletConnector.createSession();

      if (onUri) {
        onUri(provider._walletConnector.uri);
      }

      provider._walletConnector.on("connect", async (error: Error) => {
        if (error) {
          return reject(error);
        }

        return resolve(provider);
      });
    } else {
      return resolve(provider);
    }
  });
};

export default ConnectToWalletConnect;
