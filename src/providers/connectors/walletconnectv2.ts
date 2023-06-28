import { IAbstractConnectorOptions, getChainId } from "../../helpers";

interface Metadata {
	name: string;
	description: string;
	url: string;
	icons: string[];
	verifyUrl?: string;
	redirect?: {
		native?: string;
		universal?: string;
	};
}


interface EthereumRpcMap {
  [chainId: string]: string;
}

export interface IWalletConnectV2ConnectorOptions extends IAbstractConnectorOptions {
  projectId: string;
  /**
   * @note Chains that your app intents to use and the peer MUST support. If the peer does not support these chains, the connection will be rejected.
   * @default [1]
   * @example [1, 3, 4, 5, 42]
   */
  chains: number[];
  /**
   * @note Optional chains that your app MAY attempt to use and the peer MAY support. If the peer does not support these chains, the connection will still be established.
   * @default [1]
   * @example [1, 3, 4, 5, 42]
   */
  optionalChains?: number[];
  /**
   * @note Methods that your app intents to use and the peer MUST support. If the peer does not support these methods, the connection will be rejected.
   * @default ["eth_sendTransaction", "personal_sign"]
   */
  methods?: string[];
  /**
   * @note Methods that your app MAY attempt to use and the peer MAY support. If the peer does not support these methods, the connection will still be established.
   */
  optionalMethods?: string[];
  events?: string[];
  optionalEvents?: string[];
  rpcMap?: EthereumRpcMap;
  metadata?: Metadata;
  showQrModal: boolean;
  disableProviderPing?: boolean;
  relayUrl?: string;
	/**
   * @note QrModalOptions removed from Web3Modal v1.0, please use Web3Modal v2.0 instead
   */
  // qrModalOptions?: QrModalOptions;
		/**
   * @note KeyValueStorageOptions removed from Web3Modal v1.0, please use Web3Modal v2.0 instead
   */
  // storageOptions?: KeyValueStorageOptions;
}

const ConnectToWalletConnectV2 = (
  WalletConnectV2Provider: any,
  opts: IWalletConnectV2ConnectorOptions
) => {
	const chains = [ ...opts.chains, opts.network && getChainId(opts.network) ? getChainId(opts.network) : 1]
  return new Promise(async (resolve, reject) => {
		const provider = await WalletConnectV2Provider.init({...opts, chains})
    try {
      await provider.enable();
      resolve(provider);
    } catch (e) {
      reject(e);
    }
  });
};

export default ConnectToWalletConnectV2;
