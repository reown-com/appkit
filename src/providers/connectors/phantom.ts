declare global {
  interface Window {
    phantom: {
      solana: any;
      ethereum: any;
    };
  }
}

////////////////
// INTERFACES //
////////////////

interface PhantomOptions {
  networkType: "solana" | "ethereum";
}

///////////////
// CONNECTOR //
///////////////

/**
 * @dev Connector to connect to Phantom wallet
 * @param _ NOT NEEDED
 * @param {PhantomOptions} options Options for Phantom wallet
 * @returns Phantom Provider injected by Phantom Wallet web extension
 */
const ConnectToPhantom = async (_: any, options: PhantomOptions) => {
  let provider = null;

  // If Phantom exists
  if (typeof window.phantom?.[options.networkType] !== 'undefined') {
    provider = window.phantom?.[options.networkType];
    try {
      await provider.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      throw error;
    }
  }
  
  // If Phantom does not exist
  else {
    throw new Error("phantom wallet not found");
  }

  // Return provider
  return provider;
};

export default ConnectToPhantom;
