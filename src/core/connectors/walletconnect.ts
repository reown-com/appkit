// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";

export interface IWalletConnectConnectorOptions {
  bridge?: string;
  qrcode?: boolean;
  onUri?: (uri: string) => void;
}

const ConnectToWalletConnect = (opts: IWalletConnectConnectorOptions) => {
  return new Promise(async (resolve, reject) => {
    if (!opts.qrcode && !opts.onUri) {
      throw new Error("Must provide onUri callback when qrcode is disabled");
    }
    const defaultBridge = "https://bridge2.walletconnect.org";
    const provider = new WalletConnectProvider({
      bridge: opts.bridge || defaultBridge,
      qrcode: opts.qrcode
    });

    if (!provider._walletConnector.connected) {
      await provider._walletConnector.createSession();

      if (opts.onUri) {
        opts.onUri(provider._walletConnector.uri);
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
