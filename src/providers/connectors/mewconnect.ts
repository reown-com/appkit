import { IAbstractConnectorOptions, getChainId } from "../../helpers";

export interface IMewConnectConnectorOptions extends IAbstractConnectorOptions {
  infuraId?: string;
  rpc?: { [chainId: number]: string };
}

export const getProvider = async (
  MewConnectProvider: any,
  opts: IMewConnectConnectorOptions
) => {
  let infuraId = "";
  let rpc = undefined;
  let chainId = 1;

  if (opts) {
    infuraId = opts.infuraId || "";
    rpc = opts.rpc || undefined;
    if (opts.infuraId && !rpc) {
      rpc = `wss://mainnet.infura.io/ws/v3/${infuraId}`;
    }
    chainId =
      opts.network && getChainId(opts.network) ? getChainId(opts.network) : 1;
  }

  if (!MewConnectProvider.Provider.isConnected) {
    const mewConnect = new MewConnectProvider.Provider();
    const provider = mewConnect.makeWeb3Provider(chainId, rpc, true);

    mewConnect.on("disconnected", () => {});
    return provider;
  }
};

export const enableProvider = async (
  MewConnectProvider: any,
  opts: IMewConnectConnectorOptions
) => {
  const provider = await getProvider(MewConnectProvider, opts);
  await provider.enable();
  return provider;
};
