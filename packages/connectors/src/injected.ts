export interface IEthereum {
  request: (data: { method: string }) => void;
}

// TODO: Find a way to avoid this (?)
declare global {
  interface Window {
    ethereum: IEthereum;
    web3: any;
    updateWeb3Modal: any;
  }
}

const ConnectToInjected = async () => {
  let provider: IEthereum | null = null;
  if (typeof window.ethereum !== "undefined") {
    provider = window.ethereum;
    try {
      if (provider !== null)
        await provider.request({ method: "eth_requestAccounts" });
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
