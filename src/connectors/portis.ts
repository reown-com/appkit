import Portis from "@portis/web3";

export interface IPortisConnectorOptions {
  id: string;
  network?: string;
}

const ConnectToPortis = async (opts: IPortisConnectorOptions) => {
  if (opts && opts.id) {
    try {
      const id = opts.id;
      const network = opts.network || "mainnet";
      const pt = new Portis(id, network);
      pt.showPortis();
      pt.onLogin(() => {
        return pt.provider;
      });
    } catch (error) {
      throw new Error(error);
    }
  } else {
    throw new Error("Missing Portis Id");
  }
};

export default ConnectToPortis;
