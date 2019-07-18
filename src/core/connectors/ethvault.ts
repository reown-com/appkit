import { IFrameEthereumProvider } from '@ethvault/iframe-provider';

const ConnectToEthvault = async () => {
  if (!window || !window.parent || window.parent === window.self) {
    throw new Error('Not embedded in iframe.');
  }

  const provider = new IFrameEthereumProvider();

  await provider.enable();

  (provider as any).isIFrame = true;

  return provider;
};

export default ConnectToEthvault;
