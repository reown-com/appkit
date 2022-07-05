const ConnectToBitkeep = async () => {
  let provider = null;
  if (typeof window?.bitkeep?.ethereum !== 'undefined') {
    provider = window?.bitkeep?.ethereum;
    try {
      console.log('ConnectToBitkeep')
      await provider.request({ method: 'eth_requestAccounts' })
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

export default ConnectToBitkeep;
