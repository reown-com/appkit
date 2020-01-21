import { IProviderInfo } from "../helpers/types";

// @ts-ignore
import Web3DefaultLogo from "./logos/web3-default.svg";
// @ts-ignore
import MetaMaskLogo from "./logos/metamask.svg";
// @ts-ignore
import SafeLogo from "./logos/safe.svg";
// @ts-ignore
import NiftyWalletLogo from "./logos/niftyWallet.png";
// @ts-ignore
import TrustLogo from "./logos/trust.svg";
// @ts-ignore
import DapperLogo from "./logos/dapper.png";
// @ts-ignore
import CoinbaseLogo from "./logos/coinbase.svg";
// @ts-ignore
import CipherLogo from "./logos/cipher.svg";
// @ts-ignore
import imTokenLogo from "./logos/imtoken.svg";
// @ts-ignore
import StatusLogo from "./logos/status.svg";
// @ts-ignore
import TokenaryLogo from "./logos/tokenary.png";
// @ts-ignore
import OperaLogo from "./logos/opera.svg";

export const FALLBACK_INJECTED: IProviderInfo = {
  id: "injected",
  name: "Web3",
  logo: Web3DefaultLogo,
  type: "injected",
  check: "isWeb3",
  styled: {
    noShadow: false
  },
  package: {
    required: []
  }
};

export const METAMASK_INJECTED: IProviderInfo = {
  id: "injected",
  name: "MetaMask",
  logo: MetaMaskLogo,
  type: "injected",
  check: "isMetaMask",
  styled: {
    noShadow: true
  },
  package: {
    required: []
  }
};

export const SAFE_INJECTED: IProviderInfo = {
  id: "injected",
  name: "Safe",
  logo: SafeLogo,
  type: "injected",
  check: "isSafe",
  styled: {
    noShadow: true
  },
  package: {
    required: []
  }
};

export const NIFTY_INJECTED: IProviderInfo = {
  id: "injected",
  name: "Nifty",
  logo: NiftyWalletLogo,
  type: "injected",
  check: "isNiftyWallet",
  styled: {
    noShadow: true
  },
  package: {
    required: []
  }
};

export const DAPPER_INJECTED: IProviderInfo = {
  id: "injected",
  name: "Dapper",
  logo: DapperLogo,
  type: "injected",
  check: "isDapper",
  styled: {
    noShadow: true
  },
  package: {
    required: []
  }
};

export const OPERA_INJECTED: IProviderInfo = {
  id: "injected",
  name: "Opera",
  logo: OperaLogo,
  type: "injected",
  check: "isOpera",
  styled: {
    noShadow: false
  },
  package: {
    required: []
  }
};

export const TRUST_INJECTED: IProviderInfo = {
  id: "injected",
  name: "Trust",
  logo: TrustLogo,
  type: "injected",
  check: "isTrust",
  styled: {
    noShadow: false
  },
  package: {
    required: []
  }
};

export const COINBASE_INJECTED: IProviderInfo = {
  id: "injected",
  name: "Coinbase",
  logo: CoinbaseLogo,
  type: "injected",
  check: "isToshi",
  styled: {
    noShadow: false
  },
  package: {
    required: []
  }
};

export const CIPHER_INJECTED: IProviderInfo = {
  id: "injected",
  name: "Cipher",
  logo: CipherLogo,
  type: "injected",
  check: "isCipher",
  styled: {
    noShadow: false
  },
  package: {
    required: []
  }
};

export const IMTOKEN_INJECTED: IProviderInfo = {
  id: "injected",
  name: "imToken",
  logo: imTokenLogo,
  type: "injected",
  check: "isImToken",
  styled: {
    noShadow: false
  },
  package: {
    required: []
  }
};

export const STATUS_INJECTED: IProviderInfo = {
  id: "injected",
  name: "Status",
  logo: StatusLogo,
  type: "injected",
  check: "isStatus",
  styled: {
    noShadow: false
  },
  package: {
    required: []
  }
};

export const TOKENARY_INJECTED: IProviderInfo = {
  id: "injected",
  name: "Tokenary",
  logo: TokenaryLogo,
  type: "injected",
  check: "isTokenary",
  styled: {
    noShadow: false
  },
  package: {
    required: []
  }
};

export const injected: IProviderInfo[] = [
  FALLBACK_INJECTED,
  METAMASK_INJECTED,
  SAFE_INJECTED,
  NIFTY_INJECTED,
  DAPPER_INJECTED,
  OPERA_INJECTED,
  TRUST_INJECTED,
  COINBASE_INJECTED,
  CIPHER_INJECTED,
  IMTOKEN_INJECTED,
  STATUS_INJECTED,
  TOKENARY_INJECTED
];
