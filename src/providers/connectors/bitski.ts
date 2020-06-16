import { IAbstractConnectorOptions } from "../../helpers";

interface IBitskiOptions extends IAbstractConnectorOptions {
  clientId: string;
  callbackUrl: string;
  extraBitskiOptions?: any;
  extraProviderOptions?: any;
}

const ConnectToBitski = async (
  Bitski: any,
  opts: IBitskiOptions
) => {
  const bitski = new Bitski(opts.clientId, opts.callbackUrl, opts.extraBitskiOptions);

  await bitski.signIn();

  const provider = bitski.getProvider(opts.extraProviderOptions)

  return provider;
};

export default ConnectToBitski;
