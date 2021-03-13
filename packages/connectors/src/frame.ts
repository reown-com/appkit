const ConnectToFrame = async (ethProvider: any) => {
  try {
    const provider = ethProvider('frame');
    provider.isFrameNative = true;
    return provider;
  } catch (err) {
    throw err;
  }
};

export default ConnectToFrame;
