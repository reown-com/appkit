// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";
import { SimpleFunction } from "src/helpers/types";

export interface IWalletConnectConnectorOptions {
  infuraId: string;
  bridge?: string;
  qrcode?: boolean;
  network?: string;
  onUri?: (uri: string) => void;
}

function getChainId(network: string) {
  const infuraChainIds = {
    mainnet: 1,
    ropsten: 3,
    rinkeby: 4,
    goerli: 5,
    kovan: 42
  };
  const chainId = infuraChainIds[network];
  if (!chainId) {
    throw new Error(`Invalid or unknown chainId for network=${network}`);
  }
  return chainId;
}

const ConnectToWalletConnect = (opts: IWalletConnectConnectorOptions) => {
  return new Promise(async (resolve, reject) => {
    let bridge = "https://bridge.walletconnect.org";
    let qrcode = true;
    let onUri: SimpleFunction | null = null;
    let infuraId = "";
    let chainId = 1;

    if (opts) {
      bridge = opts.bridge || bridge;
      qrcode = typeof opts.qrcode !== "undefined" ? opts.qrcode : qrcode;
      onUri = opts.onUri || onUri;
      infuraId = opts.infuraId || "";
      chainId = opts.network ? getChainId(opts.network) : 1;
    }

    if (!qrcode && !onUri) {
      reject(new Error("Must provide onUri callback when qrcode is disabled"));
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
