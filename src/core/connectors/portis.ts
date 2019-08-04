import Portis from "@portis/web3";

export interface IPortisConnectorOptions {
  id: string;
  network?: string;
}

const ConnectToPortis = async (opts: IPortisConnectorOptions) => {
  return new Promise(async (resolve, reject) => {
    if (opts && opts.id) {
      try {
        const id = opts.id;
        const network = opts.network || "mainnet";
        const pt = new Portis(id, network);
        pt.onLogin(() => {
          resolve(pt.provider);
        });
        await pt.showPortis();
      } catch (error) {
        return reject(error);
      }
    } else {
      return reject(new Error("Missing Portis Id"));
    }
  });
};

export default ConnectToPortis;
