import { IAbstractConnectorOptions } from "../../helpers";

export interface IDcentConnectorOptions extends IAbstractConnectorOptions {
  rpcUrl: string;
  chainId: number;
}

const ConnectToDcentWallet = async (
  DcentProvider: any,
  opts: IDcentConnectorOptions
) => {
  const provider = new DcentProvider(opts);

  await provider.enable();

  return provider;
};

export default ConnectToDcentWallet;
