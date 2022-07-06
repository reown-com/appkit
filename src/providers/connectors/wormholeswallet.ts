const ConnectToWormholesWallet = async () => {
    let provider = null;
    // @ts-ignore
    if (typeof window.wormholes !== "undefined") {
      // @ts-ignore
      provider = window.wormholes;
      try {
        await provider.enable()
      } catch (error) {
        throw new Error("User Rejected");
      }
    } else {
      throw new Error("No Binance Chain Wallet found");
    }
    return provider;
  };
  
  export default ConnectToWormholesWallet;
  
  