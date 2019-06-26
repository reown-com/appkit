// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";

export interface IWalletConnectConnectorOptions {
  bridge?: string;
  qrcode?: boolean;
  onUri?: (uri: string) => void;
}

const ConnectToWalletConnect = async (opts: IWalletConnectConnectorOptions) => {
  const defaultBridge = "https://bridge.walletconnect.org";
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
        throw error;
      }

      return provider;
    });
  } else {
    return provider;
  }
};

export default ConnectToWalletConnect;
