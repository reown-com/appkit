const ConnectToBoltX = async () => {
  let provider = null;
  if (typeof (window as any).boltX !== 'undefined') {
    provider = (window as any).boltX.ethereum;
    try {
      await provider.request({ method: 'eth_requestAccounts' })
    } catch (error) {
      throw new Error("User Rejected");
    }
  } else {
    throw new Error("BoltX not found");
  }
  return provider;
};

export default ConnectToBoltX;
