import Squarelink from "squarelink";

export interface ISquarelinkConnectorOptions {
  id: string;
  network?: string;
}

const ConnectToSquarelink = async (opts: ISquarelinkConnectorOptions) => {
  return new Promise(async (resolve, reject) => {
    if (opts && opts.id) {
      try {
        const id = opts.id;
        const network = opts.network || "mainnet";
        const sqlk = new Squarelink(id, network);
        sqlk.getProvider().enable().then(() => {
          resolve(sqlk.getProvider());
        })
      } catch (error) {
        return reject(error);
      }
    } else {
      return reject(new Error("Missing Squarelink Id"));
    }
  });
};

export default ConnectToPortis;
