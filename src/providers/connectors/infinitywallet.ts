import { IAbstractConnectorOptions, getChainId } from "../../helpers";

const ConnectInfinityWallet = async (
  InfinityWalletConnect: any,
  opts: IAbstractConnectorOptions
) => {
  let provider = null;
  try {
    let chainId = 1;

    if (opts) {
      chainId =
        opts.network && getChainId(opts.network) ? getChainId(opts.network) : 1;
    }

    if (
      typeof (window as any).ethereum !== "undefined" &&
      window.ethereum?.isInfinityWallet
    ) {
      const infinitywalletConnector = new InfinityWalletConnect.InfinityWalletConnector(
        {
          supportedChainIds: [chainId]
        }
      );
      provider = await infinitywalletConnector.getProvider();
    } else {
      InfinityWalletConnect.openInfinityWallet(window.location.href, chainId);
      throw new Error("Not open in Infinity Wallet, or cant find provider");
    }
  } catch (e) {
    throw e;
  }
  return provider;
};

export default ConnectInfinityWallet;
