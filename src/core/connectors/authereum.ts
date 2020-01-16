export interface IAuthereumConnectorOptions {
  network?: string;
}

const ConnectToAuthereum = (Authereum: any, opts: IAuthereumConnectorOptions) => {
  return new Promise(async (resolve, reject) => {
    try {
      const authereum = new Authereum(opts.network);
      const provider = authereum.getProvider();
      provider.authereum = authereum
      await provider.enable();
      resolve(provider);
    } catch (error) {
      return reject(error);
    }
  });
};

export default ConnectToAuthereum;
