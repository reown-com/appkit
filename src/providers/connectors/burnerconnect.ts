interface Wallet {
  origin: string;
  name: string;
}

export interface IBurnerConnectorOptions {
  hubUrl?: string;
  defaultNetwork?: string;
  defaultWallets?: Wallet[],
}

const ConnectToBurnerConnect = async (
  BurnerConnectProvider: any,
  opts: IBurnerConnectorOptions
) => {
  const provider = new BurnerConnectProvider(opts);

  await provider.enable();

  return provider;
};

export default ConnectToBurnerConnect;
