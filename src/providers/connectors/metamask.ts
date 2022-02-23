const ConnectToMetaMaskWallet = async () => {
  if ((typeof window.ethereum === 'undefined') || !window.ethereum.isMetaMask) {
    // TODO: integrate https://github.com/MetaMask/metamask-onboarding
    // open new window
    window.open("https://metamask.io/?utm_source=web3modal&utm_medium=codelib&utm_campaign=dappname", "_blank");
    return;
  }

  let provider = null;
  if (typeof window.ethereum !== 'undefined') {
    provider = window.ethereum;
    try {
      await provider.request({ method: 'eth_requestAccounts' })
    } catch (error) {
      throw new Error("User Rejected");
    }
  } else {
    throw new Error("No MetaMask Wallet found");
  }
  return provider;
};

export default ConnectToMetaMaskWallet;
