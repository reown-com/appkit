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

const ConnectToPortis = (Portis: any, opts: IPortisConnectorOptions) => {
  return new Promise(async (resolve, reject) => {
    if (opts && opts.id) {
      try {
        const id = opts.id;
        const network = opts.network || "mainnet";
        const config = opts.config;
        const pt = new Portis(id, network, config);
        await pt.provider.enable();
        pt.provider._portis = pt;
        resolve(pt.provider);
      } catch (error) {
        return reject(error);
      }
    } else {
      return reject(new Error("Missing Portis Id"));
    }
  });
};

export default ConnectToPortis;
