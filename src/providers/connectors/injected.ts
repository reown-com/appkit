export const getProvider = async () => {
  let provider = null;
  if (window.ethereum) {
    provider = window.ethereum;
  } else if (window.web3) {
    provider = window.web3.currentProvider;
  } else {
    throw new Error("No Web3 Provider found");
  }
  return provider;
};

export const enableProvider = async () => {
  const provider = await getProvider();
  await provider.enable();
  return provider;
};
