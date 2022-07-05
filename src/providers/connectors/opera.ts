const ConnectToOpera = async () => {
  let provider = null;
  if (typeof (window as any).ethereum?.isOpera !== "undefined") {
    provider = window.ethereum;
    try {
      await provider.request({ method: "eth_requestAccounts" });
    } catch (error) {
      throw new Error("User Rejected");
    }
  } else {
    throw new Error("Opera not found");
  }
  return provider;
};

export default ConnectToOpera;
