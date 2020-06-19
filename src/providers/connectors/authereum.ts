import { IAbstractConnectorOptions } from "../../helpers";

export interface IAuthereumConnectorOptions extends IAbstractConnectorOptions {}

export const getProvider = async (
  Authereum: any,
  opts: IAuthereumConnectorOptions
) => {
  const authereum = new Authereum(opts.network);
  const provider = authereum.getProvider();
  provider.authereum = authereum;
  return provider;
};

export const enableProvider = (
  Authereum: any,
  opts: IAuthereumConnectorOptions
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = await getProvider(Authereum, opts);
      await provider.enable();
      resolve(provider);
    } catch (error) {
      return reject(error);
    }
  });
};
