export interface IWalletConnectConnectorBaseOptions {
  bridge?: string;
  qrcode?: boolean;
  network?: string;
  chainId?: number;
}

interface IWalletConnectOptionsInfura extends IWalletConnectConnectorBaseOptions {
  infuraId: string;
}

interface IRPCMap {
  [chainId: number]: string;
}

interface IWalletConnectOptionsRPC extends IWalletConnectConnectorBaseOptions {
  infuraId?: null;
  rpc: IRPCMap;
}

export type IWalletConnectConnectorOptions = IWalletConnectOptionsInfura | IWalletConnectOptionsRPC;

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

const ConnectToWalletConnect = (
  WalletConnectProvider: any,
  opts: IWalletConnectConnectorOptions
) => {
  return new Promise(async (resolve, reject) => {
    let bridge = "https://bridge.walletconnect.org";
    let qrcode = true;
    let infuraId = "";
    let chainId = 1;
    let rpc = {};

    if (opts) {
      bridge = opts.bridge || bridge;
      qrcode = typeof opts.qrcode !== "undefined" ? opts.qrcode : qrcode;
      infuraId = (opts as IWalletConnectOptionsInfura).infuraId || "";
      chainId = opts.network ? getChainId(opts.network) : opts.chainId || 1;
      rpc = (opts as IWalletConnectOptionsRPC).rpc || {};
    }

    const provider = new WalletConnectProvider({
      bridge,
      qrcode,
      infuraId,
      rpc,
      chainId
    });

    await provider.enable();

    resolve(provider);
  });
};

export default ConnectToWalletConnect;
