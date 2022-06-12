const ConnectToClvWallet = async () => {
  let provider = null;
  if (typeof window.clover !== 'undefined') {
    provider = window.clover;
    try {
      await provider.request({ method: 'eth_requestAccounts' })
    } catch (error) {
      throw new Error("User Rejected");
    }
  } else {
    throw new Error("No CLV Wallet found");
  }
  return provider;
};

export default ConnectToClvWallet;
