// @ts-ignore
import Squarelink from "squarelink";

export interface INetwork {
  nodeUrl: string;
  chainId?: string;
}

export interface IOptions {
  scope?: string[];
}

export interface ISquarelinkConnectorOptions {
  id: string;
  network?: string | INetwork;
  config?: IOptions;
}

const ConnectToSquarelink = async (opts: ISquarelinkConnectorOptions) => {
  return new Promise(async (resolve, reject) => {
    if (opts && opts.id) {
      try {
        const id = opts.id;
        const network = opts.network || "mainnet";
        const config = opts.config;
        const sqlk = new Squarelink(id, network, config);
        const provider = sqlk.getProvider();
        provider.enable().then(() => {
          resolve(sqlk.getProvider());
        });
      } catch (error) {
        console.log(error);
        return reject(error);
      }
    } else {
      return reject(new Error("Missing Squarelink Id"));
    }
  });
};

export default ConnectToSquarelink;
