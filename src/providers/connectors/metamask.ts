import { getInjectedProviderId } from "../../helpers";

const ConnectToMetaMaskWallet = async () => {
  const injectedProviderId = getInjectedProviderId();
  if (typeof window.ethereum === "undefined" || injectedProviderId) {
    // TODO: integrate https://github.com/MetaMask/metamask-onboarding
    // open new window
    window.open(
      "https://metamask.io/?utm_source=web3modal&utm_medium=codelib&utm_campaign=dappname",
      "_blank"
    );
    return;
  }

  let provider = null;
  if (typeof window.ethereum !== "undefined") {
    provider = window.ethereum;
    try {
      await provider.request({ method: "eth_requestAccounts" });
    } catch (error) {
      throw new Error("User Rejected");
    }
  } else {
    throw new Error("No MetaMask Wallet found");
  }
  return provider;
};

export default ConnectToMetaMaskWallet;
