const ConnectToInjected = async () => {
  let provider = null;
  if (typeof window.ethereum !== 'undefined') {
    provider = window.ethereum;
    try {
      if (typeof provider.request !== 'undefined') {
        await provider.request({ method: 'eth_requestAccounts' })
      } else {
        await provider.enable()
      }
    } catch (error) {
      throw new Error("User Rejected");
    }
  } else if (window.web3) {
    provider = window.web3.currentProvider;
  } else {
    throw new Error("No Web3 Provider found");
  }
  return provider;
};

export default ConnectToInjected;
