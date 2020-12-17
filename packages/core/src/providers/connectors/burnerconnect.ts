import { IAbstractConnectorOptions } from '../../helpers';

interface Wallet {
  origin: string;
  name: string;
}

export interface IBurnerConnectorOptions extends IAbstractConnectorOptions {
  hubUrl?: string;
  defaultNetwork?: string;
  defaultWallets?: Wallet[];
}

const ConnectToBurnerConnect = async (
  BurnerConnectProvider: any,
  opts: IBurnerConnectorOptions
) => {
  opts.defaultNetwork = opts.defaultNetwork || opts.network;
  const provider = new BurnerConnectProvider(opts);

  await provider.enable();

  return provider;
};

export default ConnectToBurnerConnect;
