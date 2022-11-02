
const ConnectToMadWallet = async () => {
  let provider = null;
  if (typeof (window as any).madwallet !== 'undefined') {
    provider = (window as any).madwallet;
    try {
      await provider.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      throw new Error("User Rejected");
    }
  } else {
    throw new Error("No Madwallet found");
  }

  return provider;
}

export default ConnectToMadWallet;
