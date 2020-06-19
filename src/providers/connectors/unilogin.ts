import { IAbstractConnectorOptions } from "../../helpers";

export interface IUniloginConnectorOptions extends IAbstractConnectorOptions {}

export const getProvider = async (
  UniLogin: any,
  opts: IUniloginConnectorOptions
) => {
  const provider = new UniLogin.create(opts.network || "mainnet");
  provider.on = () => {};
  return provider;
};

export const enableProvider = async (
  UniLogin: any,
  opts: IUniloginConnectorOptions
) => {
  const provider = await getProvider(UniLogin, opts);
  await provider.enable();
  return provider;
};
