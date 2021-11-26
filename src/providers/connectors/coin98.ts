// coin98 only support ethereum and BSC but not web3
const ConnectToCoin98 = async () => {
  let provider = null;
  if (window.ethereum && window.ethereum?.isCoin98) {
    provider = window.ethereum;

    try {
      await provider.request({ method: "eth_requestAccounts" });
    } catch (error) {
      throw new Error("User Rejected");
    }
  } else if (window.binanceSmartChain && window.binanceSmartChain?.isCoin98) {
    provider = window.binanceSmartChain;

    try {
      await provider.request({ method: "bsc_requestAccounts" });
    } catch (error) {
      throw new Error("User Rejected");
    }
  } else {
    throw new Error("No Provider found");
  }

  return provider;
};

export default ConnectToCoin98;
