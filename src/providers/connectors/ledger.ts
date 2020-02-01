// import Web3ProviderEngine from "web3-provider-engine";
// import { ledgerEthereumBrowserClientFactoryAsync } from "@0x/subproviders/lib/src";
// import { LedgerSubprovider } from "@0x/subproviders/lib/src/subproviders/ledger";
// import CacheSubprovider from "web3-provider-engine/subproviders/cache.js";
// import { RPCSubprovider } from "@0x/subproviders/lib/src/subproviders/rpc_subprovider";

// class LedgerProvider extends Web3ProviderEngine {
//   constructor(opts: any) {
//     super({
//       pollingInterval: opts.pollingInterval
//     });
//     this.addProvider(
//       new LedgerSubprovider({
//         networkId: opts.chainId,
//         ledgerEthereumClientFactoryAsync: ledgerEthereumBrowserClientFactoryAsync,
//         accountFetchingConfigs: opts.accountFetchingConfigs,
//         baseDerivationPath: opts.baseDerivationPath
//       })
//     );
//     this.addProvider(new CacheSubprovider());
//     this.addProvider(new RPCSubprovider(opts.url, opts.requestTimeoutMs));

//     this.start();
//   }
// }

export interface ILedgetConnectorOptions {
  pollingInterval?: any;
  chainId?: any;
  accountFetchingConfigs?: any;
  baseDerivationPath?: any;
  url?: any;
  requestTimeoutMs?: any;
}

const ConnectToLedger = async (
  LedgerProvider: any,
  opts: ILedgetConnectorOptions
) => {
  const provider = new LedgerProvider(opts);

  await provider.enable();

  return provider;
};

export default ConnectToLedger;
