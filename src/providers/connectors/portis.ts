import { IAbstractConnectorOptions } from "../../helpers";

export interface INetwork {
  nodeUrl: string;
  chainId?: string;
  gasRelayHubAddress?: string;
}

export type Scope = "email";

export interface IOptions {
  scope?: Scope[];
  gasRelay?: boolean;
  registerPageByDefault?: boolean;
  pocketDevId?: string;
}

export interface IPortisConnectorOptions extends IAbstractConnectorOptions {
  id: string;
  config?: IOptions;
}

export const getProvider = async (
  Portis: any,
  opts: IPortisConnectorOptions
) => {
  if (opts && opts.id) {
    const id = opts.id;
    const network = opts.network || "mainnet";
    const config = opts.config;
    const pt = new Portis(id, network, config);
    const provider = pt.provider;
    provider._portis = pt;
    return provider;
  } else {
    throw new Error("Missing Portis Id");
  }
};

export const enableProvider = async (
  Portis: any,
  opts: IPortisConnectorOptions
) => {
  const provider = await getProvider(Portis, opts);
  await provider.enable();
  return provider;
};
