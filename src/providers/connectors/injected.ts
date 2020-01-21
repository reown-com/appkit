const ConnectToInjected = async () => {
  let provider = null;
  if (window.ethereum) {
    provider = window.ethereum;
    try {
      await window.ethereum.enable();
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
