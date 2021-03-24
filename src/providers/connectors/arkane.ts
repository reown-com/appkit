import { IAbstractConnectorOptions } from "../../helpers";

export interface IArkaneConnectorOptions extends IAbstractConnectorOptions {
  clientId: string;
  secretType?: string;
  environment?: string;
}

const ConnectToArkane = (Arkane: any, opts: IArkaneConnectorOptions) => {
  return new Promise(async (resolve, reject) => {
    if (opts && opts.clientId) {
      try {
        const options = {
          clientId: opts.clientId,
          environment: opts.environment,
          secretType: opts.secretType || 'ETHEREUM',
          signMethod: "POPUP"
        };
        const provider = await (window as any).Arkane.createArkaneProviderEngine(
          options
        );
        return resolve(provider);
      } catch (error) {
        console.error(error);
        return reject(new Error("Failed to login to Arkane"));
      }
    } else {
      return reject(new Error("Please provide an Arkane client id"));
    }
  });
};

export default ConnectToArkane;
