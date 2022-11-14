import { IAbstractConnectorOptions } from "src/helpers";

export interface ILedgerConnectKitOptions
  extends IAbstractConnectorOptions {
  chainId?: number;
  infuraId?: string;
  rpc?: { [chainId: number]: string };
  bridge?: string;
}

const ConnectToLedger = async (
  loadConnectKit: any,
  opts: ILedgerConnectKitOptions
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const connectKit = await loadConnectKit();
      connectKit.checkSupport({
        providerType: 'Ethereum',
        ...opts
      });

      const provider = await connectKit.getProvider();
      provider.request({ method: 'eth_requestAccounts' });

      return resolve(provider);
    } catch (e) {
      return reject(e);
    }
  });
};

export default ConnectToLedger;
