// import TrezorConnect from "trezor-connect";
// import Web3ProviderEngine from "web3-provider-engine";
// import { TrezorSubprovider } from "@0x/subproviders/lib/src/subproviders/trezor";
// import CacheSubprovider from "web3-provider-engine/subproviders/cache.js";
// import { RPCSubprovider } from "@0x/subproviders/lib/src/subproviders/rpc_subprovider";

// class TrezorProvider extends Web3ProviderEngine {
//   constructor(opts) {
//     super({
//       pollingInterval: opts.pollingInterval
//     });
//     TrezorConnect.manifest({
//       email: opts.manifestEmail,
//       appUrl: opts.manifestAppUrl
//     });
//     this.addProvider(
//       new TrezorSubprovider({
//         trezorConnectClientApi: TrezorConnect,
//         ...opts.config
//       })
//     );
//     this.addProvider(new CacheSubprovider());
//     this.addProvider(new RPCSubprovider(opts.url, opts.requestTimeoutMs));

//     this.start();
//   }
// }

export interface ITrezorConnectorOptions {
  manifestEmail?: any;
  manifestAppUrl?: any;
  pollingInterval?: any;
  config?: any;
  url?: any;
  requestTimeoutMs?: any;
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
