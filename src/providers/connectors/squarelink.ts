import { IAbstractConnectorOptions } from "../../helpers";

export interface IOptions {
  scope?: string[];
}

export interface ISquarelinkConnectorOptions extends IAbstractConnectorOptions {
  id: string;
  config?: IOptions;
}

export const getProvider = async (
  Squarelink: any,
  opts: ISquarelinkConnectorOptions
) => {
  if (opts && opts.id) {
    const id = opts.id;
    const network = opts.network || "mainnet";
    const config = opts.config;
    const sqlk = new Squarelink(id, network, config);
    const provider = await sqlk.getProvider();
    provider.sqlk = sqlk;
    return provider;
  } else {
    throw new Error("Missing Squarelink Id");
  }
};

export const enableProvider = async (
  Squarelink: any,
  opts: ISquarelinkConnectorOptions
) => {
  const provider = await getProvider(Squarelink, opts);
  await provider.enable();
  return provider;
};
