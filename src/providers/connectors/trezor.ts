import { IAbstractConnectorOptions } from "../../helpers";

export interface ITrezorConnectorOptions extends IAbstractConnectorOptions {
  manifestEmail: string;
  manifestAppUrl: string;
  rpcUrl: string;
}

const ConnectToTrezor = async (
  TrezorProvider: any,
  opts: ITrezorConnectorOptions
) => {
  const provider = new TrezorProvider(opts);

  await provider.enable();

  return provider;
};

export default ConnectToTrezor;
