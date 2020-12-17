const ConnectToInjected = async () => {
  let provider = null;
  if ((window as any).ethereum) {
    provider = (window as any).ethereum;
    try {
      await (window as any).ethereum.enable();
    } catch (error) {
      throw new Error('User Rejected');
    }
  } else if ((window as any).web3) {
    provider = (window as any).web3.currentProvider;
  } else {
    throw new Error('No Web3 Provider found');
  }
  return provider;
};

export default ConnectToInjected;
