import { IAbstractConnectorOptions } from "../../helpers";

interface Wallet {
  origin: string;
  name: string;
}

export interface IBurnerConnectorOptions extends IAbstractConnectorOptions {
  hubUrl?: string;
  defaultNetwork?: string;
  defaultWallets?: Wallet[];
}

export const getProvider = async (
  BurnerConnectProvider: any,
  opts: IBurnerConnectorOptions
) => {
  opts.defaultNetwork = opts.defaultNetwork || opts.network;
  const provider = new BurnerConnectProvider(opts);
  return provider;
};

export const enableProvider = async (
  BurnerConnectProvider: any,
  opts: IBurnerConnectorOptions
) => {
  const provider = await getProvider(BurnerConnectProvider, opts);
  await provider.enable();
  return provider;
};
