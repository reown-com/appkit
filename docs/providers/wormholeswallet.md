# Wormholes Wallet

1. Set Provider Options

```typescript
const providerOptions = {};
const web3Modal = new Web3Modal({
  providerOptions, // required
});

const instance = await web3Modal.connectTo("wormholeswallet");
const provider = new ethers.providers.Web3Provider(instance);
const signer = provider.getSigner();
```
[For more information on Wormholes Wallet Web3 provider](http://192.168.1.237/docs/Wormholes/index.html).
