const ConnectToStarzWallet = async () => {
  let provider = null;
  // added wait time to allow extension to inject provider
  await new Promise(r => setTimeout(r, 1000));
  if (typeof window.starzwallet !== "undefined") {
    provider = window.starzwallet;
    try {
      await provider.request({ method: "eth_requestAccounts" });
    } catch (error) {
      throw new Error("User Rejected");
    }
  } else {
    throw new Error("No 99Starz Wallet found");
  }
  return provider;
};

export default ConnectToStarzWallet;
