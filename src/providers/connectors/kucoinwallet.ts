const ConnectToKucoinWallet = async () => {
  let provider = null;
  if (typeof window.BinanceChain !== 'undefined') {
    provider = window.BinanceChain;
    try {
      await provider.request({ method: 'eth_requestAccounts' })
    } catch (error) {
      throw new Error("User Rejected");
    }
  } else {
    throw new Error("No Kucoin Wallet found");
  }
  return provider;
};

export default ConnectToKucoinWallet;
