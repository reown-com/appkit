# Migrating from Web3Connect

The motivation behind rebranding Web3Connect came from the community feedback that was confused with WalletConnect. Web3Connect spin off from WalletConnect and its similar name made very difficult to distinguish.

Therefore it was rebrand to Web3Modal to differentiate and make it more self-explanatory. With this rebranding came on major breaking change.

The React Button was removed from the API and the Core Module was moved to be exposed by default. So if you were using the Core Module before the rebranding you can fix it as follows:

**BEFORE**

```javascript
import Web3Connect from "web3connect";

const web3Connect = new Web3Connect.Core({ ...options });
```

**AFTER**

```javascript
import Web3Modal from "web3modal";

const web3Modal = new Web3Modal({ ...options });
```
