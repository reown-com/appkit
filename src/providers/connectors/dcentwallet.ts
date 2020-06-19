import { IAbstractConnectorOptions } from "../../helpers";

export interface IDcentConnectorOptions extends IAbstractConnectorOptions {
  rpcUrl: string;
  chainId: number;
}

export const getProvider = async (
  DcentProvider: any,
  opts: IDcentConnectorOptions
) => {
  const provider = new DcentProvider(opts);
  return provider;
};

export const enableProvider = async (
  DcentProvider: any,
  opts: IDcentConnectorOptions
) => {
  const provider = await getProvider(DcentProvider, opts);
  await provider.enable();
  return provider;
};
