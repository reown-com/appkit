import { IAbstractConnectorOptions } from "../../helpers";

export interface ISequenceConnectorOptions extends IAbstractConnectorOptions {
  appName: string;
  defaultNetwork?: string;
  networkRpcUrl?: string;
  getSequenceWallet?: (sequenceWallet: any) => void
  onConnect?: (connectDetails: any) => void
}

const ConnectToSequence = async (
  sequence: any,
  opts?: ISequenceConnectorOptions
) => {
  let provider;
  if (window?.ethereum?.isSequence) {
    provider = window.ethereum;
    try {
      await provider.request({ method: 'eth_requestAccounts' })
      return provider;
    } catch (error) {
      throw new Error("User Rejected");
    }
  }

  let wallet;

  try {
    wallet = sequence.getWallet();
  } catch (err) {
    let walletConfig = {};
    if (opts?.networkRpcUrl) {
      walletConfig = { networkRpcUrl: opts.networkRpcUrl }
    }

    wallet = await sequence.initWallet(opts?.defaultNetwork || 'mainnet', walletConfig);
  }

  if (!wallet.isConnected()) {
    const connectDetails = await wallet.connect({
      app: opts?.appName,
      authorize: true
    });
    
    if (!connectDetails.connected) {
      throw new Error("Failed to connect");
    }
    
    if (opts?.onConnect) {
      opts.onConnect(connectDetails)
    }
  }
  
  provider = wallet.getProvider();
  provider.sequence = wallet;

  if (opts?.getSequenceWallet) {
    opts.getSequenceWallet(wallet)
  }

  return provider;
};

export default ConnectToSequence;
